import { useWatchLiveItemSubscription } from '@src/gql/types.generated';
import { LiveItem } from '@src/client/interfaces';

// eslint-disable-next-line import/no-cycle
import formatLiveItem from '@src/client/formatters/formatLiveItem';

// eslint-disable-next-line import/no-cycle
import client from '..';

export default (
    tokenId: string | undefined,
    onProccessedData: (data: Omit<LiveItem, 'lifecycle'>) => void,
) => {
    const graph = client.live.graph();

    useWatchLiveItemSubscription({
        client: graph,
        shouldResubscribe: true,
        fetchPolicy: 'cache-first',
        variables: { tokenId: tokenId || '' },
        onSubscriptionData: (x) => {
            if (
                tokenId &&
                x.subscriptionData &&
                x.subscriptionData.data &&
                x.subscriptionData.data.item
            ) {
                const { item } = x.subscriptionData.data;

                onProccessedData(formatLiveItem(item));
            }
        },
    });

    return null;
};
