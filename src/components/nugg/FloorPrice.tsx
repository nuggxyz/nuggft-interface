import React, { CSSProperties, FunctionComponent, useEffect } from 'react';
import { animated, useSpring } from 'react-spring';

import { EthInt, Fraction } from '../../classes/Fraction';
import Colors from '../../lib/colors';
import Layout from '../../lib/layout';
import AppState from '../../state/app';
import ProtocolState from '../../state/protocol';
import SocketState from '../../state/socket';
import CurrencyText from '../general/Texts/CurrencyText/CurrencyText';
import Text from '../general/Texts/Text/Text';

type Props = { style?: CSSProperties };

const FloorPrice: FunctionComponent<Props> = ({ style }) => {
    const shares = ProtocolState.select.nuggftStakedShares();
    const staked = ProtocolState.select.nuggftStakedEth();

    const socket = SocketState.select.Stake();

    const [realtime, setRealTime] = React.useState<number>(
        EthInt.fromFraction(new Fraction(staked, shares)).decimal.toNumber(),
    );

    useEffect(() => {
        console.log({ socket, shares, staked });
        if (socket !== undefined) {
            setRealTime(
                EthInt.fromFraction(
                    new Fraction(socket.staked, socket.shares),
                ).decimal.toNumber(),
            );
        } else {
            setRealTime(
                EthInt.fromFraction(
                    new Fraction(staked, shares),
                ).decimal.toNumber(),
            );
        }
    }, [socket, staked, shares]);

    const springStyle = useSpring({
        // zIndex: 1000,
        display: 'flex',
        borderRadius: Layout.borderRadius.large,
        alignItems: 'center',
        justifyContent: 'center',
        margin: '.3rem 0rem',
        opacity: realtime !== 0 ? 1 : 0,
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
            <CurrencyText size="small" image="eth" value={realtime} />
        </animated.div>
    );
};

export default FloorPrice;
