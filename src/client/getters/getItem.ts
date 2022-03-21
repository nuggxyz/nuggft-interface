import gql from 'graphql-tag';

import { executeQuery3 } from '@src/graphql/helpers';
// eslint-disable-next-line import/no-cycle
import { LiveItem, liveItemGql, LiveItemGql, TryoutData } from '@src/client/hooks/useLiveItem';
import { EthInt } from '@src/classes/Fraction';
import { extractItemId } from '@src/lib';

const getItem = async (tokenId: string) => {
    const item = await executeQuery3<LiveItemGql>(
        gql`query getItem($tokenId: ID!) ${liveItemGql()}`,
        { tokenId: extractItemId(tokenId) },
    ).then((x) => {
        if (x && x.item) {
            const tmp: Omit<LiveItem, 'tryout'> = {
                type: 'item' as const,
                count: x.item.count,
                swaps: x.item.swaps.map((y) => {
                    return {
                        type: 'item',
                        id: y?.id,
                        epoch: {
                            id: Number(y?.epoch?.id ?? 0),
                            startblock: Number(y?.epoch?.startblock),
                            endblock: Number(y?.epoch?.endblock),
                            status: y?.epoch?.status,
                        },
                        eth: new EthInt(y?.eth),
                        leader: y?.leader?.id,
                        owner: y?.owner?.id,
                        endingEpoch: y && y.endingEpoch ? +y.endingEpoch : null,
                        num: Number(y?.num),
                        isTryout: y && y.endingEpoch === null,
                    };
                }),
                activeSwap: x.item.activeSwap
                    ? {
                          count: 1,
                          type: 'item' as const,
                          id: x.item.activeSwap?.id,
                          epoch: {
                              id: Number(x.item.activeSwap?.epoch?.id),
                              startblock: Number(x.item.activeSwap?.epoch?.startblock),
                              endblock: Number(x.item.activeSwap?.epoch?.endblock),
                              status: x.item.activeSwap?.epoch?.status,
                          },
                          eth: new EthInt(x.item.activeSwap?.eth),
                          leader: x.item.activeSwap?.leader?.id,

                          owner: x.item.activeSwap.owner?.id,

                          endingEpoch:
                              x.item.activeSwap && x.item.activeSwap.endingEpoch
                                  ? +x.item.activeSwap.endingEpoch
                                  : null,
                          num: Number(x.item.activeSwap?.num),
                          isTryout: false,
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

            return {
                ...tmp,
                tryout,
            };
        }
        return undefined;
    });

    return item;
};

export default getItem;
