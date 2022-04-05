import { useWatchLiveNuggSubscription } from '@src/gql/types.generated';
import formatLiveNugg from '@src/client/formatters/formatLiveNugg';
import useLiveNuggBackup from '@src/client/backups/useLiveNuggBackup';
import client from '@src/client';
import { useHealth } from '@src/client/hooks/useHealth';

export default (tokenId: string | undefined) => {
    const graph = client.live.graph();

    const updateToken = client.mutate.updateToken();

    useWatchLiveNuggSubscription({
        client: graph,
        shouldResubscribe: true,
        fetchPolicy: 'cache-first',
        variables: { tokenId: tokenId || '' },
        onSubscriptionData: (x) => {
            if (
                tokenId &&
                !tokenId.isItemId() &&
                x.subscriptionData &&
                x.subscriptionData.data &&
                x.subscriptionData.data.nugg
            ) {
                const formatted = formatLiveNugg(x.subscriptionData.data.nugg);
                if (formatted) updateToken(tokenId, formatted);
            }
        },
    });

    useLiveNuggBackup(useHealth().graphProblem, tokenId);

    return null;
};
