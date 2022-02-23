import React, { CSSProperties, FunctionComponent } from 'react';
import { animated, useSpring } from 'react-spring';

import { EthInt } from '../../classes/Fraction';
import Colors from '../../lib/colors';
import Layout from '../../lib/layout';
import AppState from '../../state/app';
import ProtocolState from '../../state/protocol';
import CurrencyText from '../general/Texts/CurrencyText/CurrencyText';
import Text from '../general/Texts/Text/Text';

type Props = { style?: CSSProperties };

const FloorPrice: FunctionComponent<Props> = ({ style }) => {
    const valuePerShare = ProtocolState.select.nuggftStakedEthPerShare();

    const springStyle = useSpring({
        // zIndex: 1000,
        display: 'flex',
        borderRadius: Layout.borderRadius.large,
        alignItems: 'center',
        justifyContent: 'center',
        margin: '.3rem 0rem',
        opacity: valuePerShare !== '0' ? 1 : 0,
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
                }}>
                FLOOR
            </Text>
            <CurrencyText
                size="small"
                image="eth"
                value={new EthInt(valuePerShare).decimal.toNumber()}
            />
        </animated.div>
    );
};

export default FloorPrice;
