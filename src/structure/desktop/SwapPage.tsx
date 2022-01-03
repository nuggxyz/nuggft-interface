import React, { FunctionComponent, useEffect, useState } from 'react';

import RingAbout from '../../components/nugg/RingAbout/RingAbout';
import TheRing from '../../components/nugg/TheRing/TheRing';
import Wallet from '../../components/nugg/Wallet/Wallet';
import AppState from '../../state/app';

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
                            <TheRing />
                        </div>
                        <div style={styles.tabletRingAbout}>
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
                            <RingAbout />
                        </div>
                        <div style={styles.innerContainer}>
                            <Wallet />
                        </div>
                    </div>
                    <div style={styles.theRingContainer}>
                        <TheRing />
                    </div>
                </>
            )}
        </div>
    );
};

export default SwapPage;
