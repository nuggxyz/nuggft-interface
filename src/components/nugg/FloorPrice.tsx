import React, { CSSProperties, FunctionComponent } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { BigNumber } from 'ethers';

import Colors from '@src/lib/colors';
import Layout from '@src/lib/layout';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import Text from '@src/components/general/Texts/Text/Text';
import client from '@src/client';

type Props = { style?: CSSProperties };

const FloorPrice: FunctionComponent<Props> = ({ style }) => {
    const { stake } = client.hook.useSafeLiveStake();

    const springStyle = useSpring({
        // zIndex: 1000,
        display: 'flex',
        borderRadius: Layout.borderRadius.large,
        alignItems: 'center',
        justifyContent: 'center',
        margin: '.3rem 0rem',
        opacity: stake && stake.shares !== BigNumber.from(0) ? 1 : 0,
        ...style,
    });

    return (
        <animated.div style={springStyle}>
            <Text
                type="text"
                size="smaller"
                weight="bolder"
                textStyle={{
                    paddingRight: '.6rem',
                    color: Colors.nuggBlueText,
                    font: Layout.font.sf.bold,
                    marginTop: '.1rem',
                }}
            >
                FLOOR
            </Text>
            <CurrencyText
                size="small"
                image="eth"
                value={stake ? stake.eps.decimal.toNumber() : 0}
            />
        </animated.div>
    );
};

export default FloorPrice;
