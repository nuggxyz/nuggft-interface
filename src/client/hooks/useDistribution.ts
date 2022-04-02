import { useMemo } from 'react';

import web3 from '@src/web3';
import { LiveSwap } from '@src/client/interfaces';

export default (swapData?: LiveSwap) => {
    const provider = web3.hook.usePriorityProvider();

    const ownerEns = web3.hook.usePriorityAnyENSName(
        swapData?.type === 'item' ? ('nugg' as const) : provider,
        swapData?.owner || '',
    );

    const distribution = useMemo(() => {
        if (swapData) {
            const extra = swapData.eth.sub(swapData.bottom);

            const isMint = swapData.bottom.number === 0;

            const proto = extra.divide(isMint ? 2 : 10);

            return {
                proto,
                stake: extra.sub(proto),
                owner: swapData.bottom,
            };
        }
        return undefined;
    }, [swapData]);

    return { ownerEns, distribution };
};
