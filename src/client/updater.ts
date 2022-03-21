import React from 'react';

import client from '@src/client';
import web3 from '@src/web3';

// eslint-disable-next-line import/no-cycle
import useRpcUpdater from './update/useRpcUpdater';
// eslint-disable-next-line import/no-cycle
import useGraphUpdater from './update/useGraphUpdater';
// eslint-disable-next-line import/no-cycle
import useLiveOffers from './hooks/useLiveOffers';
// eslint-disable-next-line import/no-cycle

export default () => {
    const address = web3.hook.usePriorityAccount();

    const updateProtocol = client.mutate.updateProtocol();

    useRpcUpdater();

    const lastSwap__tokenId = client.live.lastSwap.tokenId();

    useLiveOffers(lastSwap__tokenId);

    useGraphUpdater();

    // clean up on account change
    React.useEffect(() => {
        return () => {
            updateProtocol({
                myNuggs: [],
                myLoans: [],
                myUnclaimedItemOffers: [],
                myUnclaimedNuggOffers: [],
            });
        };
    }, [address]);

    return null;
};
