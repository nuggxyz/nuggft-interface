import { useWatchLiveItemSubscription } from '@src/gql/types.generated';
import formatLiveItem from '@src/client/formatters/formatLiveItem';
import client from '@src/client';
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

	return null;
};
