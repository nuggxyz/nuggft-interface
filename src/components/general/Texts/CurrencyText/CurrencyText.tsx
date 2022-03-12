import React, { useEffect, useState } from 'react';
import { useSpring, animated, config } from '@react-spring/web';

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
}

const CurrencyText: React.FC<BalanceProps> = ({
    value,
    decimals = 1,
    // unit = '',
    // prefix = '',
    // duration = 2,
    percent = false,
    forceGwei = false,
    showUnit = true,
    // image,
    ...props
}) => {
    const [isGwei, setIsGwei] = useState(forceGwei);
    const prevValue = usePrevious(value);
    useEffect(() => {
        !forceGwei && setIsGwei(value < 0.00001);
    }, [value, forceGwei]);

    const [spring] = useSpring(
        {
            val: value,
            from: { val: prevValue ? prevValue : value * 0.5 },
            config: config.molasses,
        },
        [prevValue, value],
    );

    return (
        <Text
            {...props}
            textStyle={{
                ...styles.textStyle,
                ...props.textStyle,
            }}
        >
            <animated.div className="number" style={{ paddingRight: '.5rem' }}>
                {spring.val.to((val) =>
                    isGwei
                        ? (val * 10 ** 9).toFixed(decimals)
                        : val > 1
                        ? val.toPrecision(percent ? 3 : 6)
                        : val.toFixed(percent ? 2 : 5),
                )}
            </animated.div>
            {percent && '%'}
            {showUnit && <div style={{ paddingRight: '0rem' }}>{isGwei ? 'gwei' : 'ETH'}</div>}
        </Text>
    );
};

export default React.memo(CurrencyText);
