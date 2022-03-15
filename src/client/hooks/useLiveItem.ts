import React, { useEffect } from 'react';

import { EthInt } from '@src/classes/Fraction';
// eslint-disable-next-line import/no-cycle
import { NuggId } from '@src/client/router';
import { extractItemId } from '@src/lib';

// eslint-disable-next-line import/no-cycle
import { UseLiveItemSubscription, UseLiveItemDocument } from '@src/gql/types.generated';

// eslint-disable-next-line import/no-cycle
import { EpochData } from '@src/client/interfaces';

// eslint-disable-next-line import/no-cycle
import client from '..';

// eslint-disable-next-line import/no-cycle
import { LiveSwapBase } from './useLiveNugg';

export interface LiveItemSwap extends LiveSwapBase {
    type: 'item';
    id: string;
    epoch: EpochData | null;
    eth: EthInt;
    leader: string;
    owner: string;
    endingEpoch: number | null;
    num: number;
    isTryout: boolean;
}

export interface LiveActiveItemSwap extends LiveItemSwap {
    count: number;
}
export type TryoutData = { nugg: NuggId; eth: EthInt };
export interface LiveItem {
    type: 'item';
    activeSwap?: LiveActiveItemSwap;
    swaps: LiveItemSwap[];
    count: number;
    tryout: {
        count: number;
        swaps: TryoutData[];
        max?: TryoutData;
        min?: TryoutData;
    };
}

export const useLiveItem = (tokenId: string | undefined) => {
    const [item, setItem] = React.useState<LiveItem>();

    const apollo = client.live.apollo();

    useEffect(() => {
        if (apollo && tokenId) {
            const instance = apollo
                .subscribe<UseLiveItemSubscription>({
                    query: UseLiveItemDocument,
                    variables: { tokenId: extractItemId(tokenId) },
                })
                .subscribe((x) => {
                    if (x.data && x.data.item) {
                        const tmp: Omit<LiveItem, 'tryout'> = {
                            type: 'item' as const,
                            count: Number(x.data.item.count),
                            swaps: x.data.item.swaps.map((y) => {
                                return {
                                    type: 'item',
                                    id: y?.id,
                                    epoch: y.epoch
                                        ? {
                                              id: Number(y?.epoch?.id ?? 0),
                                              startblock: Number(y?.epoch?.startblock),
                                              endblock: Number(y?.epoch?.endblock),
                                              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                              // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
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
                            activeSwap: x.data.item.activeSwap
                                ? {
                                      count: 1,
                                      type: 'item' as const,
                                      id: x.data.item.activeSwap?.id,
                                      epoch: x.data.item.activeSwap.epoch
                                          ? {
                                                id: Number(x.data.item.activeSwap.epoch.id),
                                                startblock: Number(
                                                    x.data.item.activeSwap.epoch.startblock,
                                                ),
                                                endblock: Number(
                                                    x.data.item.activeSwap.epoch.endblock,
                                                ),
                                                status: x.data.item.activeSwap.epoch.status,
                                            }
                                          : null,
                                      eth: new EthInt(x.data.item.activeSwap?.eth),
                                      leader: x.data.item.activeSwap?.leader!.id,

                                      owner: x.data.item.activeSwap.owner?.id,

                                      endingEpoch:
                                          x.data.item.activeSwap &&
                                          x.data.item.activeSwap.endingEpoch
                                              ? Number(x.data.item.activeSwap.endingEpoch)
                                              : null,
                                      num: Number(x.data.item.activeSwap?.num),
                                      isTryout: false,
                                      //   dotnuggRawCache: null,
                                  }
                                : undefined,
                        };

                        const tryout = tmp.swaps.reduce(
                            (prev: LiveItem['tryout'] | undefined, curr) => {
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
                                    swaps: [swap, ...prev.swaps].sort((a, b) =>
                                        a.eth.gt(b.eth) ? 1 : -1,
                                    ),
                                };
                            },
                            undefined,
                        ) ?? { count: 0, min: undefined, max: undefined, swaps: [] };

                        setItem({
                            ...tmp,
                            tryout,
                        });
                    }
                });
            return () => {
                instance.unsubscribe();
            };
        }
        return () => undefined;
    }, [apollo, tokenId]);

    return item;
};
