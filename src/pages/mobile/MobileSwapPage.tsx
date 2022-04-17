import React from 'react';

import client from '@src/client';
import { SwapData } from '@src/client/interfaces';
import SwapCard from '@src/components/mobile/SwapCard';

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
            (
                prev: {
                    current: SwapData[];
                    next: SwapData[];
                    recent: SwapData[];
                },
                curr,
            ) => {
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

            {/* {lastswap && <SwapCard tokenId={lastswap} />} */}

            {sortedAll.current.map((x) => (
                <SwapCard tokenId={x.tokenId} key={`SwapCard-Current-${x.tokenId}`} />
            ))}

            {sortedAll.next.map((x) => (
                <SwapCard tokenId={x.tokenId} key={`SwapCard-Next-${x.tokenId}`} />
            ))}
        </div>
    );
};

export default SwapView;
