import client from '@src/client/index';
import { EthInt } from '@src/classes/Fraction';
import { TokenId } from '@src/client/router';
import {
    useBetterLiveItemOffersSubscription,
    useBetterLiveOffersSubscription,
} from '@src/gql/types.generated';
import { createItemId, extractItemId } from '@src/lib/index';

const useLiveItemOffers = (tokenId?: string) => {
    const graph = client.live.graph();
    const updateOffers = client.mutate.updateOffers();

    useBetterLiveItemOffersSubscription({
        client: graph,
        shouldResubscribe: true,
        fetchPolicy: 'network-only',
        variables: { tokenId: tokenId ? extractItemId(tokenId) : '' },
        onSubscriptionData: (x) => {
            if (
                tokenId &&
                x.subscriptionData &&
                x.subscriptionData.data &&
                x.subscriptionData.data.item
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
                                  isBackup: false,
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
                                  isBackup: false,
                              };
                          })
                        : []),
                ]);
            }
        },
    });
    return null;
};

const useLiveNuggOffers = (tokenId?: string) => {
    const graph = client.live.graph();
    const updateOffers = client.mutate.updateOffers();

    useBetterLiveOffersSubscription({
        client: graph,
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
                            isBackup: false,
                        };
                    }),
                ]);
            }
        },
    });
    return null;
};

export default (tokenId: TokenId | undefined) => {
    useLiveItemOffers(tokenId);
    useLiveNuggOffers(tokenId);
    return null;
};
