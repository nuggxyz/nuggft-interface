import React from 'react';

import client from '@src/client';
import { SwapData } from '@src/client/interfaces';
import SwapCard from '@src/components/mobile/SwapCard';
import useNotableSwaps from '@src/client/hooks/useNotableSwaps';

const SwapView = () => {
    const epoch = client.live.epoch.id();

    const all = useNotableSwaps();

    const sortedAll = React.useMemo(() => {
        return all.reduce(
            (
                prev: {
                    current: SwapData[];
                    next: SwapData[];
                    recent: SwapData[];
                    potential: SwapData[];
                },
                curr,
            ) => {
                if (epoch) {
                    if (curr.endingEpoch === epoch) {
                        prev.current.push(curr);
                    } else if (curr.endingEpoch === epoch + 1) {
                        prev.next.push(curr);
                    } else if (curr.endingEpoch === 0) {
                        prev.potential.push(curr);
                    } else if (curr.endingEpoch && curr.endingEpoch < epoch) {
                        prev.recent.push(curr);
                    }
                }
                return prev;
            },
            { current: [], next: [], recent: [], potential: [] },
        );
    }, [all, epoch]);

    React.useEffect(() => {
        console.log(all);
    }, [all]);
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

            {sortedAll.current.map((x) => (
                <SwapCard tokenId={x.tokenId} key={`SwapCard-Current-${x.tokenId}`} />
            ))}

            {sortedAll.next.map((x) => (
                <SwapCard tokenId={x.tokenId} key={`SwapCard-Next-${x.tokenId}`} />
            ))}

            {sortedAll.potential.map((x) => (
                <SwapCard tokenId={x.tokenId} key={`SwapCard-Potential-${x.tokenId}`} />
            ))}
        </div>
    );
};

export default SwapView;
