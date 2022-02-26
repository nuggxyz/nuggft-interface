import React, { CSSProperties, FunctionComponent, useEffect } from 'react';
import { animated, useSpring } from '@react-spring/web';

import { EthInt, Fraction } from '@src/classes/Fraction';
import Colors from '@src/lib/colors';
import Layout from '@src/lib/layout';
import ProtocolState from '@src/state/protocol';
import SocketState from '@src/state/socket';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import Text from '@src/components/general/Texts/Text/Text';

type Props = { style?: CSSProperties };

const FloorPrice: FunctionComponent<Props> = ({ style }) => {
    const shares = ProtocolState.select.nuggftStakedShares();
    const staked = ProtocolState.select.nuggftStakedEth();

    const socket = SocketState.select.Stake();

    const [realtime, setRealTime] = React.useState<number>(
        EthInt.fromFraction(new Fraction(staked, shares)).decimal.toNumber(),
    );

    useEffect(() => {
        if (socket !== undefined) {
            setRealTime(
                EthInt.fromFraction(new Fraction(socket.staked, socket.shares)).decimal.toNumber(),
            );
        } else {
            setRealTime(EthInt.fromFraction(new Fraction(staked, shares)).decimal.toNumber());
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
