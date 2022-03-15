import React, { useEffect } from 'react';

import { EthInt } from '@src/classes/Fraction';
import { UseLiveNuggSubscription, UseLiveNuggDocument } from '@src/gql/types.generated';

// eslint-disable-next-line import/no-cycle
import { EpochData } from '@src/client/interfaces';

// eslint-disable-next-line import/no-cycle
import client from '..';

// eslint-disable-next-line import/no-cycle
import { LiveItemSwap } from './useLiveItem';

export interface LiveSwapBase {
    type: 'nugg' | 'item';
    id: string;
    epoch?: EpochData | null;
    eth: EthInt;
    leader: string;
    owner: string;
    endingEpoch: number | null;
    num: number;
}

export interface LiveNuggSwap extends LiveSwapBase {
    type: 'nugg';
    isActive: boolean;
}

export type LiveSwap = LiveNuggSwap | LiveItemSwap;

export interface LiveNuggItem {
    id: string;
    activeSwap: string | undefined;
    feature: number;
    position: number;
}

export interface LiveNugg {
    type: 'nugg';
    activeLoan: boolean;
    activeSwap?: LiveNuggSwap;
    items: LiveNuggItem[];

    // svg: ReactSVG;
    owner: string;
    swaps: LiveNuggSwap[];
}

export const useLiveNugg = (tokenId: string | undefined) => {
    const [nugg, setNugg] = React.useState<LiveNugg>();

    const apollo = client.live.apollo();

    useEffect(() => {
        if (tokenId && apollo) {
            const instance = apollo
                .subscribe<UseLiveNuggSubscription>({
                    query: UseLiveNuggDocument,
                    variables: { tokenId },
                })
                .subscribe((x) => {
                    if (x.data && x.data.nugg) {
                        setNugg({
                            type: 'nugg',
                            activeLoan: !!x.data.nugg.activeLoan?.id,
                            owner: x.data.nugg.user?.id,
                            items: x.data.nugg.items.map((y) => {
                                return {
                                    id: y?.id,
                                    activeSwap: y?.activeSwap?.id,
                                    feature: Number(y?.item.feature),
                                    position: Number(y?.item.position),
                                };
                            }),
                            swaps: x.data.nugg.swaps.map((y) => {
                                return {
                                    type: 'nugg',
                                    id: y?.id,
                                    epoch: y?.epoch
                                        ? {
                                              id: Number(y?.epoch.id),
                                              startblock: Number(y?.epoch.startblock),
                                              endblock: Number(y?.epoch.endblock),
                                              status: y?.epoch.status,
                                          }
                                        : null,
                                    eth: new EthInt(y?.eth),
                                    leader: y?.leader?.id,
                                    owner: y?.owner?.id,
                                    endingEpoch: y && y.endingEpoch ? Number(y?.endingEpoch) : null,
                                    num: Number(y?.num),
                                    isActive: x.data!.nugg!.activeSwap?.id === y?.id,
                                };
                            }),
                            activeSwap: x.data.nugg.activeSwap
                                ? {
                                      type: 'nugg',
                                      id: x.data.nugg.activeSwap?.id,
                                      epoch: x.data.nugg.activeSwap?.epoch
                                          ? {
                                                id: Number(x.data.nugg.activeSwap.epoch.id),
                                                startblock: Number(
                                                    x.data.nugg.activeSwap.epoch.startblock,
                                                ),
                                                endblock: Number(
                                                    x.data.nugg.activeSwap.epoch.endblock,
                                                ),
                                                status: x.data.nugg.activeSwap.epoch.status,
                                            }
                                          : null,
                                      eth: new EthInt(x.data.nugg.activeSwap?.eth),
                                      leader: x.data.nugg.activeSwap?.leader?.id,

                                      owner: x.data.nugg.activeSwap?.owner?.id,

                                      endingEpoch:
                                          x.data.nugg.activeSwap &&
                                          x.data.nugg.activeSwap?.endingEpoch
                                              ? Number(x.data.nugg.activeSwap?.endingEpoch)
                                              : null,
                                      num: Number(x.data.nugg.activeSwap?.num),
                                      isActive: true,
                                  }
                                : undefined,
                            // svg: x.data.nugg.dotnuggRawCache as any,
                        });
                    }
                });
            return () => {
                instance.unsubscribe();
            };
        }
        return () => undefined;
    }, [apollo, tokenId]);

    return nugg;
};
