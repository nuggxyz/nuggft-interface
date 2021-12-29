import React, { FunctionComponent } from 'react';
import { animated, useSpring } from 'react-spring';

import { EthInt } from '../../classes/Fraction';
import Colors from '../../lib/colors';
import Layout from '../../lib/layout';
import AppState from '../../state/app';
import ProtocolState from '../../state/protocol';
import CurrencyText from '../general/Texts/CurrencyText/CurrencyText';
import Text from '../general/Texts/Text/Text';

type Props = {};

const FloorPrice: FunctionComponent<Props> = () => {
    const valuePerShare = ProtocolState.select.nuggftStakedEthPerShare();

    const style = useSpring({
        // position: 'absolute',
        zIndex: 1000,
        display: 'flex',
        // background: 'white',
        borderRadius: Layout.borderRadius.large,
        padding: '.4rem .7rem',
        alignItems: 'center',
        justifyContent: 'center',
        // marginLeft: '13rem',
        opacity: valuePerShare !== '0' ? 1 : 0,
    });

    return !AppState.isMobile ? (
        <animated.div style={style}>
            <Text
                type="text"
                size="small"
                weight="bolder"
                textStyle={{
                    paddingRight: '.6rem',
                    color: Colors.nuggBlueText,
                    font: Layout.font.inter.bold,
                }}>
                FLOOR
            </Text>
            <CurrencyText
                image="eth"
                value={new EthInt(
                    valuePerShare.split('.')[0],
                ).decimal.toNumber()}
            />
        </animated.div>
    ) : null;
};

export default FloorPrice;
