import { useWatchLiveNuggSubscription } from '@src/gql/types.generated';
import { LiveNugg } from '@src/client/interfaces';
import formatLiveNugg from '@src/client/formatters/formatLiveNugg';

// eslint-disable-next-line import/no-cycle
import client from '..';

export default (tokenId: string | undefined, onProccessedData: (data: LiveNugg) => void) => {
    const graph = client.live.graph();

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
                if (formatted) onProccessedData(formatted);
            }
        },
    });
    return null;
};
