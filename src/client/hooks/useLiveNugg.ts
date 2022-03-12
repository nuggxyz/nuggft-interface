import { gql } from '@apollo/client';
import React, { useEffect } from 'react';

import { EthInt } from '@src/classes/Fraction';

import client from '..';

import { LiveItemSwap } from './useLiveItem';

export interface LiveSwapBase {
    type: 'nugg' | 'item';
    id: string;
    epoch: {
        id: number;
        startblock: number;
        endblock: number;
        status: 'OVER' | 'ACTIVE' | 'PENDING';
    };
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

export const swapgql = () => gql`
    {
        id
        endingEpoch
        epoch {
            id
            startblock
            endblock
            status
            starttime
        }
        num
        eth
        ethUsd
        owner {
            id
        }
        leader {
            id
        }
    }
`;

export interface LiveNuggItem {
    id: string;
    activeSwap: string;
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
                .subscribe<{
                    nugg: {
                        id: string;
                        user: { id: string };
                        // dotnuggRawCache: string;
                        items: {
                            id: string;
                            activeSwap: {
                                id: string;
                            };
                            item: {
                                id: string;
                                // dotnuggRawCache
                                feature: number;
                                position: number;
                            };
                        }[];
                        activeSwap?: {
                            id: string;
                            epoch: {
                                id: string;
                                startblock: string;
                                endblock: string;
                                status: 'OVER' | 'ACTIVE' | 'PENDING';
                            };
                            eth: string;
                            leader: {
                                id: string;
                            };
                            owner: {
                                id: string;
                            };
                            endingEpoch: string | null;
                            num: string;
                        };
                        swaps: {
                            id: string;
                            epoch: {
                                id: string;
                                startblock: string;
                                endblock: string;
                                status: 'OVER' | 'ACTIVE' | 'PENDING';
                            };
                            eth: string;
                            leader: {
                                id: string;
                            };
                            owner: {
                                id: string;
                            };
                            endingEpoch: string | null;
                            num: string;
                        }[];
                        activeLoan: { id: string };
                    };
                }>({
                    query: gql`
                        subscription useLiveNugg($tokenId: ID!) {
                            nugg(id: $tokenId) {
                                id
                                # dotnuggRawCache
                                # id
                                user {
                                    id
                                }
                                items {
                                    id
                                    activeSwap {
                                        id
                                    }
                                    item {
                                        id
                                        dotnuggRawCache
                                        feature
                                        position
                                    }
                                }
                                activeLoan {
                                    id
                                }
                                swaps ${swapgql()}
                                activeSwap ${swapgql()}
                            }
                        }
                    `,
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
                                    feature: y?.item.feature,
                                    position: y?.item.position,
                                };
                            }),
                            swaps: x.data.nugg.swaps.map((y) => {
                                return {
                                    type: 'nugg',
                                    id: y?.id,
                                    epoch: {
                                        id: +y?.epoch?.id,
                                        startblock: +y?.epoch?.startblock,
                                        endblock: +y?.epoch?.endblock,
                                        status: y?.epoch?.status,
                                    },
                                    eth: new EthInt(y?.eth),
                                    leader: y?.leader?.id,
                                    owner: y?.owner?.id,
                                    endingEpoch: y && y.endingEpoch ? +y?.endingEpoch : null,
                                    num: +y?.num,
                                    isActive: x.data?.nugg.activeSwap?.id === y?.id,
                                };
                            }),
                            activeSwap: x.data.nugg.activeSwap
                                ? {
                                      type: 'nugg',
                                      id: x.data.nugg.activeSwap?.id,
                                      epoch: {
                                          id: +x.data.nugg.activeSwap?.epoch?.id,
                                          startblock: +x.data.nugg.activeSwap?.epoch?.startblock,
                                          endblock: +x.data.nugg.activeSwap?.epoch?.endblock,
                                          status: x.data.nugg.activeSwap?.epoch?.status,
                                      },
                                      eth: new EthInt(x.data.nugg.activeSwap?.eth),
                                      leader: x.data.nugg.activeSwap?.leader?.id,

                                      owner: x.data.nugg.activeSwap?.owner?.id,

                                      endingEpoch:
                                          x.data.nugg.activeSwap &&
                                          x.data.nugg.activeSwap?.endingEpoch
                                              ? +x.data.nugg.activeSwap?.endingEpoch
                                              : null,
                                      num: +x.data.nugg.activeSwap?.num,
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
    }, [apollo, tokenId]);

    return nugg;
};
