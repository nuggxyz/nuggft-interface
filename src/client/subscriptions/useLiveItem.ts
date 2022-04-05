import { useWatchLiveItemSubscription } from '@src/gql/types.generated';
import useLiveItemBackup from '@src/client/backups/useLiveItemBackup';
import formatLiveItem from '@src/client/formatters/formatLiveItem';
import { extractItemId } from '@src/lib';
import client from '@src/client';
import { useHealth } from '@src/client/hooks/useHealth';

export default (tokenId: string | undefined) => {
    const graph = client.live.graph();

    const updateToken = client.mutate.updateToken();

    useWatchLiveItemSubscription({
        client: graph,
        shouldResubscribe: true,
        fetchPolicy: 'cache-first',
        variables: { tokenId: extractItemId(tokenId || '') },

        onSubscriptionData: (x) => {
            if (
                tokenId &&
                tokenId.isItemId() &&
                x.subscriptionData &&
                x.subscriptionData.data &&
                x.subscriptionData.data.item
            ) {
                const { item } = x.subscriptionData.data;

                updateToken(tokenId, formatLiveItem(item));
            }
        },
    });

    useLiveItemBackup(useHealth().graphProblem, tokenId);

    return null;
};
