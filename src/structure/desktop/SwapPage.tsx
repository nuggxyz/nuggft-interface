import React, { FunctionComponent } from 'react';

import AccountStats from '../../components/nugg/AccountStats/AccountStats';
import RingAbout from '../../components/nugg/RingAbout/RingAbout';
import TheRing from '../../components/nugg/TheRing/TheRing';
import Wallet from '../../components/nugg/Wallet/Wallet';

import styles from './SwapPage.styles';

type Props = {};

const SwapPage: FunctionComponent<Props> = () => {
    return (
        <div style={styles.container}>
            <div style={styles.secondaryContainer}>
                <RingAbout />
            </div>
            <div style={styles.theRingContainer}>
                <TheRing />
            </div>
            <div style={styles.secondaryContainer}>
                <Wallet />
            </div>
        </div>
    );
};

export default SwapPage;
