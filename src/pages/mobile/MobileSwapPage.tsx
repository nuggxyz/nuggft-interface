import React from 'react';

import client from '@src/client';
import SwapCard from '@src/components/mobile/SwapCard';

const SwapView = () => {
    const epoch = client.live.epoch.id();

    const abc = client.swaps.useSwapList();

    const sortedAll = React.useMemo(() => {
        return abc.reduce(
            (
                prev: {
                    current: TokenId[];
                    next: TokenId[];
                    recent: TokenId[];
                    potential: TokenId[];
                },
                curr,
            ) => {
                if (epoch) {
                    if (curr.endingEpoch === epoch) {
                        prev.current.push(curr.tokenId);
                    } else if (curr.endingEpoch === epoch + 1) {
                        prev.next.push(curr.tokenId);
                    } else if (!curr.endingEpoch) {
                        prev.potential.push(curr.tokenId);
                    } else if (curr.endingEpoch && curr.endingEpoch < epoch) {
                        prev.recent.push(curr.tokenId);
                    }
                }
                return prev;
            },
            { current: [], next: [], recent: [], potential: [] },
        );
    }, [abc, epoch]);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                // marginTop: '20px',
                marginBottom: '500px',
                alignItems: 'center',
                justifyContent: 'flex-start',
                overflow: 'scroll',
                WebkitOverflowScrolling: 'touch',
                zIndex: 0,
            }}
        >
            <div style={{ marginTop: '100px' }} />

            {sortedAll.current.map((x) => (
                <SwapCard tokenId={x} key={`SwapCard-Current-${x}`} />
            ))}

            {sortedAll.next.map((x) => (
                <SwapCard tokenId={x} key={`SwapCard-Next-${x}`} />
            ))}

            {sortedAll.potential.map((x) => (
                <SwapCard tokenId={x} key={`SwapCard-Potential-${x}`} />
            ))}
        </div>
    );
};

export default SwapView;
