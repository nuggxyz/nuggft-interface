import React, { useEffect, useState } from 'react';
import { useSpring, animated, config } from '@react-spring/web';

import Text, { TextProps } from '@src/components/general/Texts/Text/Text';
import usePrevious from '@src/hooks/usePrevious';
import { NLStaticImageKey } from '@src/components/general/NLStaticImage';
import { PairInt, CurrencyInt } from '@src/classes/Fraction';
import Loader from '@src/components/general/Loader/Loader';

import styles from './CurrencyText.styles';

type PartialText = Partial<TextProps>;

interface BalanceProps extends PartialText {
    value: number | PairInt;
    decimals?: number;
    // unit?: string;
    // prefix?: string;
    // duration?: number;
    percent?: boolean;
    image?: NLStaticImageKey;
    forceGwei?: boolean;
    forceEth?: boolean;

    showUnit?: boolean;
    stopAnimation?: boolean;
    showIncrementAnimation?: boolean;
    loadOnZero?: boolean;
    str?: string;
    loadingOnZero?: boolean;
    onlyAnimateOnIncrease?: boolean;
    stopAnimationOnStart?: boolean;

    unitOverride?: 'ETH' | 'USD';
}

const MIN = 0.000000000001;

const CurrencyText: React.FC<BalanceProps> = ({
    value: _value,
    decimals = 0,
    // unit = '',
    // prefix = '',
    // duration = 2,
    percent = false,
    forceGwei = false,
    forceEth = true,
    showUnit = true,
    stopAnimation = false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    showIncrementAnimation = false,
    loadOnZero = false,
    unitOverride,
    loadingOnZero = true,
    stopAnimationOnStart = true,
    // onlyAnimateOnIncrease = false,
    str,
    // image,
    ...props
}) => {
    const [value, unit] = React.useMemo(() => {
        if (typeof _value === 'number') return [_value, unitOverride ?? 'ETH'];
        if (unitOverride)
            return [_value[unitOverride.toLowerCase() as 'eth' | 'usd'].number, unitOverride];
        return [_value.selected.number, _value.preference];
    }, [_value, unitOverride]);

    // if (value === 0) value = MIN;
    const [isGwei, setIsGwei] = useState(forceGwei && !forceEth);
    const prevValue = usePrevious(value);
    // const prevValue2 = usePrevious(prevValue);

    // const [jumpValue, setJumpValue] = React.useState(MIN);
    // React.useEffect(() => {
    //     if (showIncrementAnimation && prevValue && prevValue !== 0 && prevValue < value) {
    //         setJumpValue(value - prevValue);
    //     }
    //     return undefined;
    // }, [value, prevValue, showIncrementAnimation]);
    useEffect(() => {
        if (!forceEth) setIsGwei(value < 0.001);
    }, [value, forceGwei, forceEth]);

    const okayAfterStart = React.useMemo(() => {
        return (
            !stopAnimationOnStart ||
            (prevValue !== undefined && prevValue !== 0 && prevValue !== value)
        );
    }, [prevValue, value, stopAnimationOnStart]);

    // console.log({ value, prevValue, okayAfterStart }, okayAfterStart ? 'AHHHHHHHH' : '');

    // const cancle = React.useMemo(() => {
    //     return (stopAnimationOnStart && (prevValue === 0 || prevValue === MIN)) ||
    //     stopAnimation || (onlyAnimateOnIncrease && prevValue2 === )
    // }, [])

    const [spring] = useSpring(
        {
            val: value || MIN,
            from: {
                val: loadOnZero && prevValue === undefined ? MIN : prevValue || value * 0.5,
            },
            config: config.molasses,
            immediate: stopAnimation || !okayAfterStart,
        },
        [prevValue, value, stopAnimation, okayAfterStart, loadOnZero],
    );
    // if (value < 13) console.log(spring.val.get());
    // const transitions = useTransition(jumpValue, {
    //     from: { opacity: 1, marginBottom: 30 },
    //     enter: { opacity: 0, marginBottom: 45 },
    //     delay: 300,
    //     cancel: !showIncrementAnimation,
    //     config: config.molasses,
    //     onRest: () => setJumpValue(MIN),
    // });

    return (
        <>
            {/* {showIncrementAnimation &&
                jumpValue !== 0 &&
                transitions(
                    (_styles, item) =>
                        item && (
                            <animated.div
                                style={{
                                    ..._styles,
                                    position: 'absolute',
                                    color: 'green',
                                }}
                            >
                                +{jumpValue.toFixed(5)}
                            </animated.div>
                        ),
                )} */}
            <Text
                {...props}
                textStyle={{
                    ...styles.textStyle,
                    ...props.textStyle,
                }}
            >
                {str && value === 0 ? (
                    str
                ) : (_value === 0 && loadingOnZero) ||
                  (_value instanceof PairInt && _value.eth.number === 0 && loadingOnZero) ? (
                    <div
                        style={{
                            width: 50,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {' '}
                        <Loader color={props?.textStyle?.color ?? 'white'} />
                    </div>
                ) : (
                    <animated.div className="number" style={{ paddingRight: '.5rem' }}>
                        {spring.val.to((val) =>
                            isGwei
                                ? (val * 10 ** 9).toFixed(decimals)
                                : percent
                                ? val >= 1
                                    ? val.toFixed(1)
                                    : val.toFixed(2)
                                : val > 1
                                ? CurrencyInt.format(val, unit === 'USD' ? 2 : 3)
                                : val.toFixed(percent ? 2 : decimals || 5),
                        )}
                    </animated.div>
                )}
                {percent && '%'}
                {!percent && showUnit && (
                    <div style={{ paddingRight: '0rem' }}>
                        {unit === 'ETH' && isGwei ? 'gwei' : unit}
                    </div>
                )}
            </Text>
        </>
    );
};

export default CurrencyText;
