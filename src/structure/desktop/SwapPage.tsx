import React, { FunctionComponent } from 'react';

import RingAbout from '@src/components/nugg/RingAbout/RingAbout';
import TheRing from '@src/components/nugg/TheRing/TheRing';
import Wallet from '@src/components/nugg/Wallet/Wallet';
import AppState from '@src/state/app';

import styles from './SwapPage.styles';

type Props = {};

const SwapPage: FunctionComponent<Props> = () => {
    const screen = AppState.select.screenType();

    return (
        <div style={styles.container}>
            {screen === 'tablet' ? (
                <>
                    <div style={styles.tabletMain}>
                        <div style={styles.tabletRing}>
                            <TheRing circleWidth={1100} />
                        </div>
                        <div style={styles.tabletRingAbout}>
                            {' '}
                            <RingAbout />
                        </div>
                    </div>
                    <div style={styles.tabletSecondary}>
                        <Wallet />
                    </div>
                </>
            ) : (
                <>
                    <div style={styles.secondaryContainer}>
                        <div style={styles.innerContainer}>
                            {' '}
                            <RingAbout />
                        </div>
                        <div style={styles.innerContainer}>
                            <Wallet />
                        </div>
                    </div>
                    <div style={styles.theRingContainer}>
                        {' '}
                        <TheRing />
                    </div>
                </>
            )}
        </div>
    );
};

export default SwapPage;
