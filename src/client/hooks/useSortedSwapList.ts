import React from 'react';

import client from '@src/client';

export default () => {
    const abc = client.swaps.useSwapList();
    const epoch = client.live.epoch.id();

    // console.log({ abc, epoch });

    return React.useMemo(() => {
        const init = { current: [], next: [], recent: [], potential: [] };
        if (!epoch) return init;
        const go = abc.reduce(
            (
                prev: {
                    current: TokenId[];
                    next: TokenId[];
                    recent: TokenId[];
                    potential: TokenId[];
                },
                curr,
            ) => {
                if (curr.endingEpoch === epoch) {
                    prev.current.push(curr.tokenId);
                } else if (curr.endingEpoch === epoch + 1) {
                    prev.next.push(curr.tokenId);
                } else if (!curr.endingEpoch) {
                    prev.potential.push(curr.tokenId);
                } else if (curr.endingEpoch && curr.endingEpoch < epoch) {
                    prev.recent.push(curr.tokenId);
                }

                return prev;
            },
            init,
        );
        go.potential.sort((a, b) => (a > b ? 1 : -1)).sort((a) => (a.startsWith('nugg') ? -1 : 1));
        return go;
    }, [abc, epoch]);
};
