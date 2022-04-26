import React, { FunctionComponent } from 'react';
import { animated } from '@react-spring/web';

import client from '@src/client';
import useLiveOffers from '@src/client/subscriptions/useLiveOffers';
import useLiveToken from '@src/client/subscriptions/useLiveToken';
import lib from '@src/lib';
import styles from '@src/components/nugg/RingAbout/RingAbout.styles';
import OwnerBlock from '@src/components/nugg/RingAbout/OwnerBlock';
import OfferText from '@src/components/nugg/RingAbout/OfferText';
import useTriggerPageLoad from '@src/client/hooks/useTriggerPageLoad';

type Props = {
    tokenId?: TokenId;
};

const RingAbout: FunctionComponent<Props> = ({ tokenId }) => {
    const swap = client.swaps.useSwap(tokenId);

    useLiveToken(tokenId);

    useLiveOffers(tokenId);

    useTriggerPageLoad(swap, 5000);

    return (
        <>
            <animated.div
                style={{
                    ...styles.container,
                    ...styles.mobile,
                    ...(swap?.endingEpoch === null && {
                        background: lib.colors.transparentGrey2,
                    }),
                    boxShadow: lib.layout.boxShadow.dark,
                }}
            >
                <div style={styles.bodyContainer}>
                    <OwnerBlock tokenId={tokenId} />
                    <OfferText tokenId={tokenId} />
                    {/* <OffersList tokenId={tokenId} /> */}
                </div>
                {/* <OfferButton tokenId={tokenId} /> */}
            </animated.div>
        </>
    );
};

export default React.memo(RingAbout);
