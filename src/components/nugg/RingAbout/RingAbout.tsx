import React, { useEffect, FunctionComponent } from 'react';
import { animated } from '@react-spring/web';

import { useDarkMode } from '@src/client/hooks/useDarkMode';
import client from '@src/client';
import { TokenId } from '@src/client/router';
import useLiveOffers from '@src/client/subscriptions/useLiveOffers';
import useLiveToken from '@src/client/subscriptions/useLiveToken';
import useDimentions from '@src/client/hooks/useDimentions';

import styles from './RingAbout.styles';
import OffersList from './OffersList';
import OwnerBlock from './OwnerBlock';
import OfferButton from './OfferButton';
import OfferText from './OfferText';
import SideCar from './SideCar';
import Caboose from './Caboose';

type Props = {
    asHappyTab?: boolean;
    manualTokenId?: TokenId;
};

const RingAbout: FunctionComponent<Props> = ({ asHappyTab = false, manualTokenId }) => {
    const { screen: screenType } = useDimentions();
    const darkmode = useDarkMode();

    const tokenId = client.live.lastSwap.tokenIdWithOptionalOverride(manualTokenId);
    const token = client.live.token(tokenId);
    const setPageIsLoaded = client.mutate.setPageIsLoaded();

    useLiveToken(tokenId);

    useLiveOffers(tokenId);

    useEffect(() => {
        setTimeout(() => {
            setPageIsLoaded();
        }, 5000);
    }, [setPageIsLoaded]);

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
                    <OwnerBlock tokenId={tokenId} />
                    <OfferText tokenId={tokenId} />
                    <OffersList tokenId={tokenId} />
                </div>
                <OfferButton tokenId={tokenId} />
            </animated.div>

            <SideCar tokenId={tokenId} />

            <Caboose tokenId={tokenId} />
        </>
    ) : null;
};

export default React.memo(RingAbout);
