import React, { FunctionComponent } from 'react';
import { animated } from '@react-spring/web';

import RingAbout from '@src/components/nugg/RingAbout/RingAbout';
import TheRing from '@src/components/nugg/TheRing/TheRing';
import Wallet from '@src/components/nugg/Wallet/Wallet';
import AppState from '@src/state/app';
import useFirefoxBlur from '@src/hooks/useFirefoxBlur';

import styles from './SwapPage.styles';

type Props = Record<string, never>;

const SwapPage: FunctionComponent<Props> = () => {
    const screen = AppState.select.screenType();

    const container = useFirefoxBlur(['modal', 'searchView'], styles.container);

    return (
        <animated.div style={container}>
            {screen === 'tablet' ? (
                <>
                    <div style={styles.tabletMain}>
                        <div style={styles.tabletRing}>
                            <TheRing circleWidth={1100} />
                        </div>
                        {/* <div style={styles.tabletRingAbout}>
                            <RingAbout />
                        </div> */}
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
        </animated.div>
    );
};

export default SwapPage;
