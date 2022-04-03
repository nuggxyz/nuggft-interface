import React, { FunctionComponent } from 'react';
import { animated } from '@react-spring/web';

import AppState from '@src/state/app';
import { useDarkMode } from '@src/client/hooks/useDarkMode';
import client from '@src/client';

import styles from './RingAbout.styles';
import OffersList from './OffersList';
import OwnerBlock from './OwnerBlock';
import OfferButton from './OfferButton';
import OfferText from './OfferText';
import SideCar from './SideCar';
import Caboose from './Caboose';

type Props = {
    asHappyTab?: boolean;
};

const RingAbout: FunctionComponent<Props> = ({ asHappyTab = false }) => {
    const screenType = AppState.select.screenType();
    const darkmode = useDarkMode();

    const tokenId = client.live.lastSwap.tokenId();
    const token = client.live.token(tokenId);

    return token ? (
        <>
            <animated.div
                style={{
                    ...(asHappyTab
                        ? styles.containerTablet
                        : darkmode
                        ? styles.containerDark
                        : styles.container),
                    ...(screenType === 'phone' && {
                        ...styles.mobile,
                    }),
                }}
            >
                <div style={styles.bodyContainer}>
                    <OwnerBlock />
                    <OfferText />
                    <OffersList tokenId={tokenId || ''} />
                </div>
                <OfferButton tokenId={tokenId} />
            </animated.div>

            <SideCar />

            <Caboose />
        </>
    ) : null;
};

export default React.memo(RingAbout);
