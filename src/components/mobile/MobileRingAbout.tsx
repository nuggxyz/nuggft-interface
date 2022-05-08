import React, { FunctionComponent } from 'react';
import { animated } from '@react-spring/web';

import client from '@src/client';
import useLiveOffers from '@src/client/subscriptions/useLiveOffers';
import useLiveToken from '@src/client/subscriptions/useLiveToken';
import lib from '@src/lib';
import styles from '@src/components/nugg/RingAbout/RingAbout.styles';
import useTriggerPageLoad from '@src/client/hooks/useTriggerPageLoad';
import useLifecycleEnhanced from '@src/client/hooks/useLifecycleEnhanced';
import { Lifecycle } from '@src/client/interfaces';
import useRemaining from '@src/client/hooks/useRemaining';

import MobileOwnerBlock from './MobileOwnerBlock';

type Props = {
    tokenId?: TokenId;
};

const RingAbout: FunctionComponent<Props> = ({ tokenId }) => {
    const swap = client.swaps.useSwap(tokenId);
    const lifecycle = useLifecycleEnhanced(swap);

    const { minutes } = useRemaining(swap?.epoch);

    useLiveToken(tokenId);

    useLiveOffers(tokenId);

    useTriggerPageLoad(swap, 5000);

    return (
        <>
            <animated.div
                style={{
                    ...styles.container,

                    ...(minutes <= 5 &&
                        lifecycle?.active && {
                            background: lib.colors.gradient,
                        }),
                    ...((swap?.endingEpoch === null || lifecycle?.lifecycle === Lifecycle.Egg) && {
                        background: lib.colors.transparentGrey2,
                    }),

                    boxShadow: lib.layout.boxShadow.dark,
                    width: '90%',
                }}
            >
                <div style={styles.bodyContainer}>
                    <MobileOwnerBlock tokenId={tokenId} />
                    {/* <OfferTextMobile tokenId={tokenId} /> */}
                    {/* <OffersList tokenId={tokenId} /> */}
                </div>
                {/* <OfferButton tokenId={tokenId} /> */}
            </animated.div>
        </>
    );
};

export default React.memo(RingAbout);
