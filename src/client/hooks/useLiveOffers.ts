import client from '@src/client/index';
import { EthInt } from '@src/classes/Fraction';
import { TokenId } from '@src/client/router';
import {
    useBetterLiveItemOffersSubscription,
    useBetterLiveOffersSubscription,
} from '@src/gql/types.generated';
import { createItemId, extractItemId } from '@src/lib/index';

const useLiveOffers = (tokenId: TokenId | undefined) => {
    const graph = client.live.graph();
    const updateOffers = client.mutate.updateOffers();

    useBetterLiveItemOffersSubscription({
        client: graph,
        skip: !tokenId?.startsWith('item-'),
        shouldResubscribe: true,
        fetchPolicy: 'network-only',
        variables: { tokenId: tokenId ? extractItemId(tokenId) : '' },
        onSubscriptionData: (x) => {
            if (
                tokenId &&
                x.subscriptionData &&
                x.subscriptionData.data &&
                x.subscriptionData.data.item &&
                x.subscriptionData.data.item.activeSwap &&
                x.subscriptionData.data.item.activeSwap.offers
            ) {
                const { upcomingActiveSwap, activeSwap } = x.subscriptionData.data.item;
                updateOffers(createItemId(tokenId), [
                    ...(activeSwap
                        ? activeSwap.offers.map((z) => {
                              return {
                                  type: 'item' as const,
                                  eth: new EthInt(z.eth),
                                  user: z.nugg.id,
                                  txhash: z.txhash,
                                  sellingNuggId: activeSwap.sellingNuggItem.nugg.id,
                              };
                          })
                        : []),
                    ...(upcomingActiveSwap
                        ? upcomingActiveSwap.offers.map((z) => {
                              return {
                                  type: 'item' as const,
                                  eth: new EthInt(z.eth),
                                  user: z.nugg.id,
                                  txhash: z.txhash,
                                  sellingNuggId: upcomingActiveSwap.sellingNuggItem.nugg.id,
                              };
                          })
                        : []),
                ]);
            }
        },
    });

    useBetterLiveOffersSubscription({
        client: graph,
        skip: tokenId?.startsWith('item-'),
        shouldResubscribe: true,
        fetchPolicy: 'network-only',
        variables: { tokenId: tokenId || '' },
        onSubscriptionData: (x) => {
            if (
                tokenId &&
                x.subscriptionData &&
                x.subscriptionData.data &&
                x.subscriptionData.data.nugg &&
                x.subscriptionData.data.nugg.activeSwap &&
                x.subscriptionData.data.nugg.activeSwap.offers
            ) {
                const { activeSwap } = x.subscriptionData.data.nugg;
                updateOffers(tokenId, [
                    ...activeSwap.offers.map((z) => {
                        return {
                            type: 'nugg' as const,
                            eth: new EthInt(z.eth),
                            user: z.user.id,
                            txhash: z.txhash,
                        };
                    }),
                ]);
            }
        },
    });

    return null;
};

export default useLiveOffers;
