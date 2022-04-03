import React, { useEffect, useState } from 'react';
import { useSpring, animated, config, useTransition } from '@react-spring/web';

import Text, { TextProps } from '@src/components/general/Texts/Text/Text';
import usePrevious from '@src/hooks/usePrevious';
import { NLStaticImageKey } from '@src/components/general/NLStaticImage';

import styles from './CurrencyText.styles';

type PartialText = Partial<TextProps>;

interface BalanceProps extends PartialText {
    value: number;
    decimals?: number;
    // unit?: string;
    // prefix?: string;
    // duration?: number;
    percent?: boolean;
    image?: NLStaticImageKey;
    forceGwei?: boolean;
    showUnit?: boolean;
    stopAnimation?: boolean;
    showIncrementAnimation?: boolean;
}

const CurrencyText: React.FC<BalanceProps> = ({
    value,
    decimals = 0,
    // unit = '',
    // prefix = '',
    // duration = 2,
    percent = false,
    forceGwei = false,
    showUnit = true,
    stopAnimation = false,
    showIncrementAnimation = false,
    // image,
    ...props
}) => {
    const [isGwei, setIsGwei] = useState(forceGwei);
    const prevValue = usePrevious(value);
    const [jumpValue, setJumpValue] = React.useState(0);
    React.useEffect(() => {
        if (showIncrementAnimation && prevValue && prevValue !== 0 && prevValue < value) {
            setJumpValue(value - prevValue);
        }
        return undefined;
    }, [value, prevValue, showIncrementAnimation]);
    useEffect(() => {
        if (!forceGwei) setIsGwei(value < 0.001);
    }, [value, forceGwei]);

    const [spring] = useSpring(
        {
            val: value,
            from: {
                val: stopAnimation ? value : prevValue || value * 0.5,
            },
            config: config.molasses,
        },
        [prevValue, value, stopAnimation],
    );

    const transitions = useTransition(jumpValue, {
        from: { opacity: 1, marginBottom: 30 },
        enter: { opacity: 0, marginBottom: 45 },
        delay: 300,
        cancel: !showIncrementAnimation,
        config: config.molasses,
        onRest: () => setJumpValue(0),
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
                <animated.div className="number" style={{ paddingRight: '.5rem' }}>
                    {spring.val.to((val) =>
                        // eslint-disable-next-line no-nested-ternary
                        isGwei
                            ? (val * 10 ** 9).toFixed(decimals)
                            : val > 1
                            ? val.toPrecision(percent ? 3 : 6)
                            : val.toFixed(percent ? 2 : decimals || 5),
                    )}
                </animated.div>
                {percent && '%'}
                {showUnit && <div style={{ paddingRight: '0rem' }}>{isGwei ? 'gwei' : 'ETH'}</div>}
            </Text>
        </>
    );
};

export default React.memo(CurrencyText, (prev, curr) => prev.value === curr.value);
