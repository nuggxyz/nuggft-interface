import React, { FunctionComponent } from 'react';
import { animated } from '@react-spring/web';

import RingAbout from '@src/components/nugg/RingAbout/RingAbout';
import TheRing from '@src/components/nugg/TheRing/TheRing';
import Wallet from '@src/components/nugg/Wallet/Wallet';
import useBlur from '@src/hooks/useBlur';
import styles from '@src/pages/SwapPage.styles';

type Props = Record<string, never>;

const SwapPageDesktopSmall: FunctionComponent<Props> = () => {
    const blur = useBlur(['/', '/swap/:id', '/live']);
    console.log('SHOULD_NOT_EXIST');
    return (
        <animated.div
            style={{
                ...styles.container,
                ...blur,
                alignItems: 'flex-start',
            }}
        >
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
        </animated.div>
    );
};

export default SwapPageDesktopSmall;
