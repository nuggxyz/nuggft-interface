import React, { FunctionComponent } from 'react';
import { animated } from '@react-spring/web';
import { useNavigate } from 'react-router';

import client from '@src/client';
import useLiveOffers from '@src/client/subscriptions/useLiveOffers';
import lib from '@src/lib';
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

    useLiveOffers(tokenId);

    useMountLogger(`${index || 'unknown'}`);

    const background = React.useMemo(() => {
        return {
            ...((minutes ?? 0) <= 5 &&
                lifecycle?.active && {
                    background: lib.colors.gradient,
                }),
            ...((swap?.endingEpoch === null || lifecycle?.lifecycle === Lifecycle.Egg) && {
                background: lib.colors.gradient4Transparent,
            }),
        };
    }, [swap?.endingEpoch, minutes, lifecycle?.active, lifecycle?.lifecycle]);

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
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    overflow: 'hidden',
                    borderRadius: lib.layout.borderRadius.medium,
                    background: lib.colors.gradient2,
                    padding: '.75rem',
                    position: 'relative',
                    ...background,
                    boxShadow: lib.layout.boxShadow.dark,
                    width: '90%',
                    height: '450px',
                }}
            >
                <MobileOwnerBlock tokenId={tokenId} visible={visible} lifecycle={lifecycle} />
            </animated.div>
        </div>
    );
};

export default MobileRingAbout;
