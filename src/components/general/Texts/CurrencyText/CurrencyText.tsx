import React from 'react';
import { useSpring, animated, config } from 'react-spring';
import Colors from '../../../../lib/colors';

import NLStaticImage, { NLStaticImageKey } from '../../NLStaticImage';
import Text, { TextProps } from '../Text/Text';

import styles from './CurrencyText.styles';

type PartialText = Partial<TextProps>;

interface BalanceProps extends PartialText {
    value: number;
    decimals?: number;
    unit?: string;
    prefix?: string;
    duration?: number;
    percent?: boolean;
    image?: NLStaticImageKey;
}

const CurrencyText: React.FC<BalanceProps> = ({
    value,
    decimals = 3,
    unit = '',
    prefix = '',
    duration = 2,
    percent = false,
    image,
    ...props
}) => {
    const spring = useSpring({
        val: value,
        from: { val: 0 },
        config: config.molasses,
    });

    return (
        <Text
            {...props}
            textStyle={{
                ...styles.textStyle,
                ...props.textStyle,
            }}>
            <animated.div className="number" style={{ paddingRight: '.5rem' }}>
                {spring.val.to((val) => val.toFixed(percent ? 2 : 5))}
            </animated.div>
            {percent && '%'}
            {image && <div style={{ paddingRight: '.3rem' }}>ETH</div>}
        </Text>
    );
};

export default React.memo(CurrencyText);
