import { EthInt } from '@src/classes/Fraction';
import { useLiveItemSubscription } from '@src/gql/types.generated';
import { LiveItem, TryoutData } from '@src/client/interfaces';

// eslint-disable-next-line import/no-cycle
import client from '..';

export default (
    tokenId: string | undefined,
    onProccessedData: (data: Omit<LiveItem, 'lifecycle'>) => void,
) => {
    const graph = client.live.graph();

    useLiveItemSubscription({
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

                const tmp = {
                    type: 'item' as const,
                    count: Number(item.count),
                    swaps: item.swaps.map((y) => {
                        return {
                            type: 'item' as const,
                            id: y?.id,
                            epoch: y.epoch
                                ? {
                                      id: Number(y?.epoch?.id ?? 0),
                                      startblock: Number(y?.epoch?.startblock),
                                      endblock: Number(y?.epoch?.endblock),
                                      status: y.epoch.status,
                                  }
                                : null,
                            eth: new EthInt(y?.eth),
                            leader: y?.leader!.id,
                            owner: y?.owner?.id,
                            endingEpoch: y && y.endingEpoch ? Number(y.endingEpoch) : null,
                            num: Number(y?.num),
                            isTryout: y && y.endingEpoch === null,
                            dotnuggRawCache: null,
                        };
                    }),
                    activeSwap: item.activeSwap
                        ? {
                              count: 1,
                              type: 'item' as const,
                              id: item.activeSwap?.id,
                              epoch: item.activeSwap.epoch
                                  ? {
                                        id: Number(item.activeSwap.epoch.id),
                                        startblock: Number(item.activeSwap.epoch.startblock),
                                        endblock: Number(item.activeSwap.epoch.endblock),
                                        status: item.activeSwap.epoch.status,
                                    }
                                  : null,
                              eth: new EthInt(item.activeSwap?.eth),
                              leader: item.activeSwap?.leader!.id,

                              owner: item.activeSwap.owner?.id,

                              endingEpoch:
                                  item.activeSwap && item.activeSwap.endingEpoch
                                      ? Number(item.activeSwap.endingEpoch)
                                      : null,
                              num: Number(item.activeSwap?.num),
                              isTryout: false,
                              //   dotnuggRawCache: null,
                          }
                        : undefined,
                };

                const tryout = tmp.swaps.reduce((prev: LiveItem['tryout'] | undefined, curr) => {
                    const swap: TryoutData = {
                        nugg: curr.owner,
                        eth: curr.eth,
                    };
                    if (!prev)
                        return {
                            min: swap,
                            max: swap,
                            count: 1,
                            swaps: [swap],
                        };
                    return {
                        min: !prev.min || prev.min.eth.gt(curr.eth) ? swap : prev.min,
                        max: !prev.max || prev.max.eth.lt(curr.eth) ? swap : prev.max,
                        count: prev.count + 1,
                        swaps: [swap, ...prev.swaps].sort((a, b) => (a.eth.gt(b.eth) ? 1 : -1)),
                    };
                }, undefined) ?? { count: 0, min: undefined, max: undefined, swaps: [] };
                onProccessedData({
                    ...tmp,
                    tryout,
                });
            }
        },
    });

    return null;
};
