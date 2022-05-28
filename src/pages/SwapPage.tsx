import React, { FunctionComponent } from 'react';
import { animated } from '@react-spring/web';

import RingAbout from '@src/components/nugg/RingAbout/RingAbout';
import TheRing from '@src/components/nugg/TheRing/TheRing';
import Wallet from '@src/components/nugg/Wallet/Wallet';
import useBlur from '@src/hooks/useBlur';
import useDimensions from '@src/client/hooks/useDimensions';
import DesktopToggleButton from '@src/components/nuggbook/DesktopToggleButton';

import styles from './SwapPage.styles';
import MobileSwapPage from './mobile/MobileSwapPage';

type Props = Record<string, never>;

const SwapPage: FunctionComponent<Props> = () => {
    const { screen } = useDimensions();

    const blur = useBlur(['/', '/swap/:id', '/live']);

    return (
        <>
            {screen === 'phone' ? (
                <MobileSwapPage />
            ) : (
                <animated.div
                    style={{
                        ...styles.container,
                        ...blur,
                        alignItems: 'flex-start',
                    }}
                >
                    {screen === 'tablet' ? (
                        <>
                            <div style={styles.tabletMain}>
                                <div style={styles.tabletRing}>
                                    <TheRing circleWidth={1100} />
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
                            <DesktopToggleButton />
                        </>
                    )}
                </animated.div>
            )}
        </>
    );
};

export default SwapPage;
