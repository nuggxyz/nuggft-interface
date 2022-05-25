import React, { FunctionComponent } from 'react';
import { animated } from '@react-spring/web';
import { useNavigate } from 'react-router';

import client from '@src/client';
import useLiveOffers from '@src/client/subscriptions/useLiveOffers';
import lib from '@src/lib';
import styles from '@src/components/nugg/RingAbout/RingAbout.styles';
import useLifecycleEnhanced from '@src/client/hooks/useLifecycleEnhanced';
import { Lifecycle } from '@src/client/interfaces';
import { useLiveTokenPoll } from '@src/client/subscriptions/useLiveNugg';
import { GodListRenderItemProps } from '@src/components/general/List/GodList';
import useMountLogger from '@src/hooks/useMountLogger';

import MobileOwnerBlock from './MobileOwnerBlock';

type Props = GodListRenderItemProps<TokenId, undefined, undefined>;

const MobileRingAbout: FunctionComponent<Props> = ({ item: tokenId, visible, index }) => {
    const navigate = useNavigate();

    const swap = client.swaps.useSwap(tokenId);

    useLiveTokenPoll(!!visible, tokenId);

    const lifecycle = useLifecycleEnhanced(visible ? swap : undefined);

    const { minutes } = client.epoch.useEpoch(swap?.epoch?.id);

    // useLiveToken(tokenId);

    useLiveOffers(tokenId);

    useMountLogger(`${index || 'unknown'}`);

    return (
        <div
            role="button"
            aria-hidden="true"
            className="mobile-pressable-div"
            style={{
                width: '100%',
                paddingBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                position: 'relative',
                height: '500px',
            }}
            onClick={(event) => {
                event.stopPropagation();
                navigate(`/swap/${tokenId}`);
            }}
        >
            <animated.div
                style={{
                    ...styles.container,

                    ...((minutes ?? 0) <= 5 &&
                        lifecycle?.active && {
                            background: lib.colors.gradient,
                        }),
                    ...((swap?.endingEpoch === null || lifecycle?.lifecycle === Lifecycle.Egg) && {
                        background: lib.colors.gradient4Transparent,
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
        </div>
    );
};

export default MobileRingAbout;
