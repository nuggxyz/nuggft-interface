import React, { FunctionComponent } from 'react';
import { animated } from '@react-spring/web';

import client from '@src/client';
import useLiveOffers from '@src/client/subscriptions/useLiveOffers';
import lib from '@src/lib';
import styles from '@src/components/nugg/RingAbout/RingAbout.styles';
import useLifecycleEnhanced from '@src/client/hooks/useLifecycleEnhanced';
import { Lifecycle } from '@src/client/interfaces';
import { useLiveTokenPoll } from '@src/client/subscriptions/useLiveNugg';

import MobileOwnerBlock from './MobileOwnerBlock';

type Props = {
    tokenId?: TokenId;
    visible: boolean;
};

const RingAbout: FunctionComponent<Props> = ({ tokenId, visible }) => {
    const swap = client.swaps.useSwap(tokenId);

    useLiveTokenPoll(visible, tokenId);

    const lifecycle = useLifecycleEnhanced(visible ? swap : undefined);

    const { minutes } = client.epoch.useEpoch(swap?.epoch?.id);

    // useLiveToken(tokenId);

    useLiveOffers(tokenId);

    return (
        <animated.div
            style={{
                ...styles.container,

                ...((minutes ?? 0) <= 5 &&
                    lifecycle?.active && {
                        background: lib.colors.gradient,
                    }),
                ...((swap?.endingEpoch === null || lifecycle?.lifecycle === Lifecycle.Egg) && {
                    background: lib.colors.transparentGrey2,
                }),

                boxShadow: lib.layout.boxShadow.dark,
                width: '90%',
                height: '450px',
            }}
        >
            <div style={styles.bodyContainer}>
                <MobileOwnerBlock tokenId={tokenId} visible={visible} lifecycle={lifecycle} />
            </div>
        </animated.div>
    );
};

export default RingAbout;
