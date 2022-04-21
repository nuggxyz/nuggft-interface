import { useWatchLiveItemSubscription } from '@src/gql/types.generated';
import useLiveItemBackup from '@src/client/backups/useLiveItemBackup';
import formatLiveItem from '@src/client/formatters/formatLiveItem';
import client from '@src/client';
import { useHealth } from '@src/client/hooks/useHealth';
import useDevStable from '@src/hooks/useDevStable';

export default (_tokenId: ItemId | undefined) => {
    const updateToken = client.mutate.updateToken();

    const tokenId = useDevStable(_tokenId);

    useWatchLiveItemSubscription({
        shouldResubscribe: !!tokenId,
        fetchPolicy: 'cache-first',
        skip: !tokenId,
        variables: { tokenId: tokenId ? tokenId.toRawId() : '' },

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
