import { useWatchLiveNuggSubscription } from '@src/gql/types.generated';
import formatLiveNugg from '@src/client/formatters/formatLiveNugg';
import useLiveNuggBackup from '@src/client/backups/useLiveNuggBackup';
import client from '@src/client';
import useDevStable from '@src/hooks/useDevStable';

export default (_tokenId: NuggId | undefined) => {
    const updateToken = client.mutate.updateToken();

    const tokenId = useDevStable(_tokenId);

    useWatchLiveNuggSubscription({
        shouldResubscribe: !!tokenId,

        fetchPolicy: 'cache-first',
        variables: { tokenId: tokenId?.toRawId() || '' },
        skip: !tokenId,
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
    const { graphProblem } = client.health.useHealth();

    useLiveNuggBackup(graphProblem, tokenId);

    return null;
};
