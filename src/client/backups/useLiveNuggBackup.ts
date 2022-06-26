import { useCallback } from 'react';

import web3 from '@src/web3';
import { useNuggftV1 } from '@src/contracts/useContract';
import { nuggBackup } from '@src/contracts/backup';

import client from '..';

// eslint-disable-next-line @typescript-eslint/no-unused-vars

export default () => {
    const liveEpoch = client.epoch.active.useId();
    const provider = web3.hook.usePriorityProvider();
    const nuggft = useNuggftV1(provider);
    const updateToken = client.mutate.updateToken();

    const callback = useCallback(
        async (tokenId: NuggId | undefined) => {
            if (!tokenId || !liveEpoch) return;
            void updateToken(tokenId, await nuggBackup(tokenId, nuggft, liveEpoch));
        },
        [nuggft, liveEpoch, updateToken],
    );

    return callback;
};
