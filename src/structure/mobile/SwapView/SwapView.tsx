import React from 'react';
import { plural, t } from '@lingui/macro';

import client from '@src/client';
import { SwapData } from '@src/client/interfaces';
import useRemaining from '@src/client/hooks/useRemaining';
import useLiveToken from '@src/client/subscriptions/useLiveToken';
import useLiveOffers from '@src/client/subscriptions/useLiveOffers';
import { TokenId } from '@src/client/router';
import RingAbout from '@src/components/nugg/RingAbout/RingAbout';
import Label from '@src/components/general/Label/Label';
import lib from '@src/lib';

const SwapView = () => {
    const activeNuggs = client.live.activeSwaps();
    const recentNuggs = client.live.recentSwaps();
    const activeItems = client.live.activeItems();
    const recentItems = client.live.recentItems();
    const epoch = client.live.epoch.id();
    const lastswap = client.live.lastSwap.tokenId();

    const all = React.useMemo(() => {
        return [...activeNuggs, ...activeItems, ...recentItems, ...recentNuggs].sort((a, b) =>
            a.eth.lt(b.eth) ? -1 : 1,
        );
    }, [activeNuggs, activeItems, recentItems, recentNuggs]);

    const sortedAll = React.useMemo(() => {
        return all.reduce(
            (prev: { current: SwapData[]; next: SwapData[]; recent: SwapData[] }, curr) => {
                if (epoch && curr.endingEpoch && curr.tokenId !== lastswap) {
                    if (curr.endingEpoch === epoch) {
                        prev.current.push(curr);
                    } else if (curr.endingEpoch === epoch + 1) {
                        prev.next.push(curr);
                    } else if (curr.endingEpoch < epoch) {
                        prev.recent.push(curr);
                    }
                }
                return prev;
            },
            { current: [], next: [], recent: [] },
        );
    }, [all, epoch, lastswap]);

    const { minutes } = useRemaining(client.live.epoch.default());

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                marginBottom: '500px',
                alignItems: 'center',
                justifyContent: 'flex-start',
                overflow: 'scroll',
                WebkitOverflowScrolling: 'touch',
            }}
        >
            <div style={{ marginTop: '80px' }} />
            <SwapCard />

            <Label
                textStyle={{ fontSize: '20px', padding: '5px', color: 'white' }}
                containerStyles={{
                    height: '50px',
                    margin: '30px',
                    background: lib.colors.gradient3Transparent,
                }}
                text={t`Ending in about ${plural(minutes, {
                    1: `${minutes} minute`,
                    other: `${minutes} minutes`,
                    0: 'less than 1 minute',
                })}`}
            />

            {sortedAll.current.map((x) => (
                <SwapCard tokenId={x.tokenId} />
            ))}
            <Label
                textStyle={{ fontSize: '20px', padding: '5px', color: 'white' }}
                containerStyles={{
                    height: '50px',
                    margin: '30px',
                    background: lib.colors.gradient3Transparent,
                }}
                text={t`Coming up`}
            />
            {sortedAll.next.map((x) => (
                <SwapCard tokenId={x.tokenId} />
            ))}
        </div>
    );
};

const SwapCard = ({
    tokenId,
}: // deselect,
{
    tokenId?: TokenId;
}) => {
    useLiveToken(tokenId);
    useLiveOffers(tokenId);

    return (
        <div
            style={{
                width: '100%',
                paddingBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                position: 'relative',
            }}
        >
            <RingAbout manualTokenId={tokenId} />
        </div>
    );
};

export default SwapView;
