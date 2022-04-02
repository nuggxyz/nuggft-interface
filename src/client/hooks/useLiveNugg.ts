import { useWatchLiveNuggSubscription } from '@src/gql/types.generated';
import formatLiveNugg from '@src/client/formatters/formatLiveNugg';

// eslint-disable-next-line import/no-cycle
import useLiveNuggBackup from '@src/client/backups/useLiveNuggBackup';

// eslint-disable-next-line import/no-cycle
import client from '..';

import { useRpcBackup } from './useHealth';

export default (tokenId: string | undefined) => {
    const graph = client.live.graph();

    const updateToken = client.mutate.updateToken();

    const backup = useRpcBackup();

    useWatchLiveNuggSubscription({
        client: graph,
        shouldResubscribe: true,
        fetchPolicy: 'cache-first',
        variables: { tokenId: tokenId || '' },
        onSubscriptionData: (x) => {
            if (
                tokenId &&
                x.subscriptionData &&
                x.subscriptionData.data &&
                x.subscriptionData.data.nugg
            ) {
                const formatted = formatLiveNugg(x.subscriptionData.data.nugg);
                if (formatted) updateToken(tokenId, formatted);
            }
        },
    });

    useLiveNuggBackup(backup, tokenId);

    return null;
};
