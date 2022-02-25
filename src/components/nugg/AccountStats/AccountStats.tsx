import React, { FunctionComponent } from 'react';
import { animated, config, useSpring } from 'react-spring';

import { EthInt } from '@src/classes/Fraction';
import AppState from '@src/state/app';
import ProtocolState from '@src/state/protocol';
import WalletState from '@src/state/wallet';
import NumberStatistic from '@src/components/nugg/Statistics/NumberStatistic';
import TextStatistic from '@src/components/nugg/Statistics/TextStatistic';

import styles from './AccountStats.styles';

type Props = {};

const AccountStats: FunctionComponent<Props> = () => {
    const userShares = WalletState.select.userShares();
    const valuePerShare = ProtocolState.select.nuggftStakedEthPerShare();

    const walletVisible = AppState.select.walletVisible();

    const containerStyle = useSpring({
        to: {
            opacity: walletVisible ? 0 : 1,
            ...styles.container,
        },
        config: config.default,
    });

    return (
        <animated.div style={containerStyle}>
            <TextStatistic label="Your shares" value={'' + userShares} transparent />
            <NumberStatistic
                label="Your worth"
                value={new EthInt(`${+valuePerShare * userShares}`)}
                transparent
                image="eth"
            />
        </animated.div>
    );
};

export default React.memo(AccountStats);
