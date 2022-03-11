import client from '@src/client';

import { useRpcUpdater } from './update/useRpcUpdater';
import { useLiveOffers } from './hooks/useLiveOffers';
import useGraphUpdater from './update/useGraphUpdater';

export default () => {
    useRpcUpdater();

    const lastSwap__tokneId = client.live.lastSwap__tokenId();

    useLiveOffers(lastSwap__tokneId);

    useGraphUpdater();

    return null;
};
