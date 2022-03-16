import React from 'react';

import { EthInt } from '@src/classes/Fraction';
import { useLiveNuggSubscription } from '@src/gql/types.generated';

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
    const [liveNugg, setLiveNugg] = React.useState<LiveNugg>();

    const graph = client.live.graph();

    useLiveNuggSubscription({
        client: graph,
        shouldResubscribe: true,
        fetchPolicy: 'cache-first',
        variables: { tokenId: tokenId || '' },
        onSubscriptionData: (x) => {
            if (
                tokenId &&
                x.subscriptionData &&
                x.subscriptionData.data &&
                x.subscriptionData.data.nugg
            ) {
                const { nugg } = x.subscriptionData.data;

                setLiveNugg({
                    type: 'nugg',
                    activeLoan: !!nugg.activeLoan?.id,
                    owner: nugg.user?.id,
                    items: nugg.items.map((y) => {
                        return {
                            id: y?.id,
                            activeSwap: y?.activeSwap?.id,
                            feature: Number(y?.item.feature),
                            position: Number(y?.item.position),
                        };
                    }),
                    swaps: nugg.swaps.map((y) => {
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
                            isActive: nugg.activeSwap?.id === y?.id,
                        };
                    }),
                    activeSwap: nugg.activeSwap
                        ? {
                              type: 'nugg',
                              id: nugg.activeSwap?.id,
                              epoch: nugg.activeSwap?.epoch
                                  ? {
                                        id: Number(nugg.activeSwap.epoch.id),
                                        startblock: Number(nugg.activeSwap.epoch.startblock),
                                        endblock: Number(nugg.activeSwap.epoch.endblock),
                                        status: nugg.activeSwap.epoch.status,
                                    }
                                  : null,
                              eth: new EthInt(nugg.activeSwap?.eth),
                              leader: nugg.activeSwap?.leader?.id,

                              owner: nugg.activeSwap?.owner?.id,

                              endingEpoch:
                                  nugg.activeSwap && nugg.activeSwap?.endingEpoch
                                      ? Number(nugg.activeSwap?.endingEpoch)
                                      : null,
                              num: Number(nugg.activeSwap?.num),
                              isActive: true,
                          }
                        : undefined,
                    // svg: nugg.dotnuggRawCache as any,
                });
            }
        },
    });

    return liveNugg;
};
