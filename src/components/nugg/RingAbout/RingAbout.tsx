import React, { useEffect, FunctionComponent } from 'react';
import { animated } from '@react-spring/web';

import { useDarkMode } from '@src/client/hooks/useDarkMode';
import client from '@src/client';
import useLiveOffers from '@src/client/subscriptions/useLiveOffers';
import useLiveToken from '@src/client/subscriptions/useLiveToken';
import useDimentions from '@src/client/hooks/useDimentions';
import Loader from '@src/components/general/Loader/Loader';
import lib from '@src/lib';

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
    const { screen: screenType, isPhone } = useDimentions();
    const darkmode = useDarkMode();

    const tokenId = client.live.lastSwap.tokenIdWithOptionalOverride(manualTokenId);
    const token = client.live.token(tokenId);
    const setPageIsLoaded = client.mutate.setPageIsLoaded();
    const isPageLoaded = client.live.pageIsLoaded();
    useLiveToken(tokenId);

    useLiveOffers(tokenId);

    useEffect(() => {
        if (token && !isPageLoaded) setPageIsLoaded();
    }, [token, setPageIsLoaded, isPageLoaded]);

    return tokenId ? (
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
                    // ...(!token && {
                    //     background: lib.colors.gradient4,
                    // }),
                    boxShadow: lib.layout.boxShadow.dark,
                }}
            >
                <div style={styles.bodyContainer}>
                    <OwnerBlock tokenId={tokenId} />
                    <OfferText tokenId={tokenId} />
                    <OffersList tokenId={tokenId} />
                </div>
                <OfferButton tokenId={tokenId} />
            </animated.div>
            {!isPhone && (
                <>
                    <SideCar tokenId={tokenId} />
                    <Caboose tokenId={tokenId.onlyItemId()} />
                </>
            )}
        </>
    ) : (
        <Loader />
    );
};

export default React.memo(RingAbout);
