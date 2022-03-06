import React, { FunctionComponent } from 'react';
import { animated, config, useSpring } from '@react-spring/web';

import { EthInt } from '@src/classes/Fraction';
import AppState from '@src/state/app';
import WalletState from '@src/state/wallet';
import NumberStatistic from '@src/components/nugg/Statistics/NumberStatistic';
import TextStatistic from '@src/components/nugg/Statistics/TextStatistic';
import client from '@src/client';

import styles from './AccountStats.styles';

type Props = {};

const AccountStats: FunctionComponent<Props> = () => {
    const userShares = WalletState.select.userShares();
    const stake = client.live.stake();

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
                value={new EthInt(`${stake ? +stake.eps * userShares : 0}`)}
                transparent
                image="eth"
            />
        </animated.div>
    );
};

export default React.memo(AccountStats);
