import React, { useEffect, FunctionComponent } from 'react';
import { animated } from '@react-spring/web';

import client from '@src/client';
import useLiveOffers from '@src/client/subscriptions/useLiveOffers';
import useLiveToken from '@src/client/subscriptions/useLiveToken';
import Loader from '@src/components/general/Loader/Loader';
import lib from '@src/lib';
import styles from '@src/components/nugg/RingAbout/RingAbout.styles';
import OffersList from '@src/components/nugg/RingAbout/OffersList';
import OwnerBlock from '@src/components/nugg/RingAbout/OwnerBlock';
import OfferButton from '@src/components/nugg/RingAbout/OfferButton';
import OfferText from '@src/components/nugg/RingAbout/OfferText';
import { SwapData } from '@src/client/interfaces';

type Props = {
    swap: SwapData;
};

const RingAbout: FunctionComponent<Props> = ({ swap }) => {
    const token = client.live.token(swap.tokenId);
    const setPageIsLoaded = client.mutate.setPageIsLoaded();
    const isPageLoaded = client.live.pageIsLoaded();

    useLiveToken(swap.tokenId);

    useLiveOffers(swap.tokenId);

    useEffect(() => {
        if (token && !isPageLoaded) setPageIsLoaded();
    }, [token, setPageIsLoaded, isPageLoaded]);

    return swap ? (
        <>
            <animated.div
                style={{
                    ...styles.container,
                    ...styles.mobile,
                    ...(swap.endingEpoch === null && {
                        background: lib.colors.gradient4,
                    }),
                    boxShadow: lib.layout.boxShadow.dark,
                }}
            >
                <div style={styles.bodyContainer}>
                    <OwnerBlock tokenId={swap.tokenId} />
                    <OfferText tokenId={swap.tokenId} />
                    <OffersList tokenId={swap.tokenId} />
                </div>
                <OfferButton tokenId={swap.tokenId} />
            </animated.div>
            {/* <>
                    <SideCar tokenId={swap.tokenId} />
                    <Caboose tokenId={tokenId.onlyItemId()} />
                </> */}
        </>
    ) : (
        <Loader />
    );
};

export default React.memo(RingAbout);
