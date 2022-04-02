import { useWatchLiveItemSubscription } from '@src/gql/types.generated';

// eslint-disable-next-line import/no-cycle
import useLiveItemBackup from '@src/client/backups/useLiveItemBackup';
import formatLiveItem from '@src/client/formatters/formatLiveItem';

// eslint-disable-next-line import/no-cycle
import { extractItemId } from '@src/lib';

// eslint-disable-next-line import/no-cycle
import client from '..';

import { useRpcBackup } from './useHealth';

export default (tokenId: string | undefined, sellingTokenId: string | undefined) => {
    const graph = client.live.graph();

    const backup = useRpcBackup();
    const updateToken = client.mutate.updateToken();
    useWatchLiveItemSubscription({
        client: graph,
        shouldResubscribe: true,
        fetchPolicy: 'cache-first',
        variables: { tokenId: extractItemId(tokenId || '') },

        onSubscriptionData: (x) => {
            if (
                tokenId &&
                x.subscriptionData &&
                x.subscriptionData.data &&
                x.subscriptionData.data.item
            ) {
                const { item } = x.subscriptionData.data;

                updateToken(tokenId, formatLiveItem(item));
            }
        },
    });

    useLiveItemBackup(backup, tokenId, sellingTokenId);

    return null;
};
