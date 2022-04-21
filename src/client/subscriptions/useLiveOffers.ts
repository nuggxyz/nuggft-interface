import client from '@src/client/index';
import { EthInt } from '@src/classes/Fraction';
import {
    useBetterLiveItemOffersSubscription,
    useBetterLiveOffersSubscription,
} from '@src/gql/types.generated';
import { buildTokenIdFactory } from '@src/prototypes';

const useLiveItemOffers = (tokenId?: ItemId) => {
    const graph = client.live.graph();
    const updateOffers = client.mutate.updateOffers();

    useBetterLiveItemOffersSubscription({
        client: graph,
        shouldResubscribe: true,
        fetchPolicy: 'network-only',
        variables: { tokenId: tokenId ? tokenId.toItemId() : '' },
        skip: !tokenId,
        onSubscriptionData: (x) => {
            if (
                tokenId &&
                x.subscriptionData &&
                x.subscriptionData.data &&
                x.subscriptionData.data.item
            ) {
                const { upcomingActiveSwap, activeSwap } = x.subscriptionData.data.item;

                updateOffers(tokenId.toItemId(), [
                    ...(activeSwap
                        ? activeSwap.offers.map((z) => {
                              return buildTokenIdFactory({
                                  tokenId,
                                  eth: new EthInt(z.eth),
                                  user: z.nugg.id.toNuggId(),
                                  txhash: z.txhash,
                                  sellingTokenId: activeSwap.sellingNuggItem.nugg.id.toNuggId(),
                                  isBackup: false,
                              });
                          })
                        : []),
                    ...(upcomingActiveSwap
                        ? upcomingActiveSwap.offers.map((z) => {
                              return buildTokenIdFactory({
                                  tokenId,
                                  eth: new EthInt(z.eth),
                                  user: z.nugg.id.toNuggId(),
                                  txhash: z.txhash,
                                  type: 'item' as const,
                                  sellingTokenId:
                                      upcomingActiveSwap.sellingNuggItem.nugg.id.toNuggId(),
                                  isBackup: false,
                              });
                          })
                        : []),
                ]);
            }
        },
    });
    return null;
};

const useLiveNuggOffers = (tokenId?: NuggId) => {
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
                        return buildTokenIdFactory({
                            type: 'nugg' as const,
                            tokenId,
                            eth: new EthInt(z.eth),
                            user: z.user.id as AddressString,
                            txhash: z.txhash,
                            isBackup: false,
                            sellingTokenId: null,
                        });
                    }),
                ]);
            }
        },
    });
    return null;
};

export default (tokenId: TokenId | undefined) => {
    useLiveItemOffers(tokenId?.onlyItemId());
    useLiveNuggOffers(tokenId?.onlyNuggId());
    return null;
};
