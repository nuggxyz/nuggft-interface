/* eslint-disable import/no-cycle */

import { TokenId } from '@src/client/router';

// export default (tokenId: TokenId | undefined) => {
//     const updateToken = client.mutate.updateToken();

//     useTypedTokenSubscription(tokenId || '', {
//         shouldResubscribe: true,
//         fetchPolicy: 'cache-first',
//         onSubscriptionData: (x) => {
//             if (tokenId && !tokenId.isItemId() && x.subscriptionData && x.subscriptionData.data) {
//                 if (!tokenId.isItemId() && x.subscriptionData.data.nugg) {
//                     updateToken(tokenId, formatLiveNugg(x.subscriptionData.data.nugg));
//                 } else if (
//                     tokenId.isItemId() &&
//                     (x.subscriptionData.data as WatchLiveItemSubscription).item
//                 ) {
//                     const { item } = x.subscriptionData.data as WatchLiveItemSubscription;
//                     if (item) {
//                         updateToken(tokenId, formatLiveItem(item));
//                     }
//                 }
//             }
//         },
//     });

//     useLiveItemBackup(
//         tokenId !== undefined && tokenId.isItemId() && useHealth().graphProblem,
//         tokenId,
//     );
//     useLiveNuggBackup(
//         tokenId !== undefined && !tokenId.isItemId() && useHealth().graphProblem,
//         tokenId,
//     );

//     return null;
// };

// type TokenFromType<T extends TokenId> = T extends ItemId ? ItemId : NuggId;

// export function useTypedTokenSubscription<T>(
//     tokenId: TokenFromType<TokenId>,
//     baseOptions: Apollo.SubscriptionHookOptions<
//         T extends ItemId ? WatchLiveItemSubscription : WatchLiveNuggSubscription,
//         T extends ItemId ? WatchLiveItemSubscriptionVariables : WatchLiveNuggSubscriptionVariables
//     >,
// ) {
//     const options = {
//         ...baseOptions,
//         variables: { tokenId: extractItemId(tokenId) } as T extends `item-${string}`
//             ? Exact<{ tokenId: string }>
//             : Exact<{ tokenId: string }>,
//     };
//     return Apollo.useSubscription<
//         T extends ItemId ? WatchLiveItemSubscription : WatchLiveNuggSubscription,
//         T extends ItemId ? WatchLiveItemSubscriptionVariables : WatchLiveNuggSubscriptionVariables
//     >(tokenId.isItemId() ? WatchLiveItemDocument : WatchLiveNuggDocument, options);
// }

/* eslint-disable import/no-cycle */

import useLiveItem from './useLiveItem';
import useLiveNugg from './useLiveNugg';

export default (tokenId: TokenId | undefined) => {
    // const go = core((state) => state.addToSubscritpionQueue);

    // useEffect(() => {
    //     if (tokenId) go(tokenId);
    // }, [tokenId, go]);
    useLiveItem(tokenId);
    useLiveNugg(tokenId);
    return null;
};
