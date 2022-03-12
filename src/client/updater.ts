import React from 'react';

import client from '@src/client';
import web3 from '@src/web3';

import { useRpcUpdater } from './update/useRpcUpdater';
import { useLiveOffers } from './hooks/useLiveOffers';
import useGraphUpdater from './update/useGraphUpdater';

export default () => {
    const address = web3.hook.usePriorityAccount();

    useRpcUpdater();

    const lastSwap__tokneId = client.live.lastSwap.tokenId();

    useLiveOffers(lastSwap__tokneId);

    useGraphUpdater();

    // clean up on account change
    React.useEffect(() => {
        return () => {
            client.actions.updateProtocol({
                myNuggs: [],
                myLoans: [],
                myUnclaimedItemOffers: [],
                myUnclaimedNuggOffers: [],
            });
        };
    }, [address]);

    return null;
};
