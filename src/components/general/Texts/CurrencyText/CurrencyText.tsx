import React, { useEffect, useState } from 'react';
import { useSpring, animated, config, useTransition } from '@react-spring/web';

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
    forceEth = false,
    showUnit = true,
    stopAnimation = false,
    showIncrementAnimation = false,
    loadOnZero = false,
    unitOverride,
    loadingOnZero,

    str,
    // image,
    ...props
}) => {
    const { value, unit } = React.useMemo(() => {
        if (typeof _value === 'number') return { value: _value, unit: unitOverride ?? 'ETH' };
        if (unitOverride)
            return {
                value: _value[unitOverride.toLowerCase() as 'eth' | 'usd'].number,
                unit: unitOverride,
            };
        return { value: _value.selected.number, unit: _value.preference };
    }, [_value, unitOverride]);

    // if (value === 0) value = MIN;
    const [isGwei, setIsGwei] = useState(forceGwei);
    const prevValue = usePrevious(value);
    const [jumpValue, setJumpValue] = React.useState(MIN);
    React.useEffect(() => {
        if (showIncrementAnimation && prevValue && prevValue !== 0 && prevValue < value) {
            setJumpValue(value - prevValue);
        }
        return undefined;
    }, [value, prevValue, showIncrementAnimation]);
    useEffect(() => {
        if (!forceEth) setIsGwei(value < 0.001);
    }, [value, forceGwei, forceEth]);

    const [spring] = useSpring(
        {
            val: value || MIN,
            from: {
                val: stopAnimation
                    ? value
                    : loadOnZero && prevValue === 0
                    ? MIN
                    : prevValue || value * 0.5,
            },
            config: config.molasses,
            cancel: stopAnimation,
        },
        [prevValue, value, stopAnimation],
    );

    const transitions = useTransition(jumpValue, {
        from: { opacity: 1, marginBottom: 30 },
        enter: { opacity: 0, marginBottom: 45 },
        delay: 300,
        cancel: !showIncrementAnimation,
        config: config.molasses,
        onRest: () => setJumpValue(MIN),
    });

    return (
        <>
            {showIncrementAnimation &&
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
                )}
            <Text
                {...props}
                textStyle={{
                    ...styles.textStyle,
                    ...props.textStyle,
                }}
            >
                {(_value === 0 && loadingOnZero) ||
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
                ) : str && value === 0 ? (
                    str
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

export default React.memo(
    CurrencyText,
    (prev, curr) => prev.value === curr.value && prev.unitOverride === curr.unitOverride,
);
