import { gql } from '@apollo/client';
import React, { useEffect } from 'react';

import client from '..';

export type LiveSwap = {
    id: string;
    epoch: {
        id: number;
        startblock: number;
        endblock: number;
        status: 'OVER' | 'ACTIVE' | 'PENDING';
    };
    eth: string;
    leader: {
        id: string;
    };
    owner: {
        id: string;
    };
    endingEpoch: number;
    num: string;
};

export const swapgql = (type: 'item' | 'nugg') => gql`
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
    activeSwap: LiveSwap;
    items: LiveNuggItem[];

    // svg: ReactSVG;
    owner: string;
    swaps: LiveSwap[];
}

export const useLiveNugg = (tokenId: string) => {
    const [nugg, setNugg] = React.useState<LiveNugg>(undefined);

    const apollo = client.live.apollo();

    useEffect(() => {
        if (tokenId) {
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
                        activeSwap: LiveSwap;
                        swaps: LiveSwap[];
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
                                swaps ${swapgql('nugg')}
                                activeSwap ${swapgql('nugg')}
                            }
                        }
                    `,
                    variables: { tokenId },
                })
                .subscribe((x) => {
                    if (x.data.nugg) {
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
                                    id: y?.id,
                                    epoch: {
                                        id: +y?.epoch?.id,
                                        startblock: +y?.epoch?.startblock,
                                        endblock: +y?.epoch?.endblock,
                                        status: y?.epoch?.status,
                                    },
                                    eth: y?.eth,
                                    leader: {
                                        id: y?.leader?.id,
                                    },
                                    owner: {
                                        id: y?.owner?.id,
                                    },
                                    endingEpoch: y?.endingEpoch,
                                    num: y?.num,
                                };
                            }),
                            activeSwap: {
                                id: x.data.nugg.activeSwap?.id,
                                epoch: {
                                    id: +x.data.nugg.activeSwap?.epoch?.id,
                                    startblock: +x.data.nugg.activeSwap?.epoch?.startblock,
                                    endblock: +x.data.nugg.activeSwap?.epoch?.endblock,
                                    status: x.data.nugg.activeSwap?.epoch?.status,
                                },
                                eth: x.data.nugg.activeSwap?.eth,
                                leader: {
                                    id: x.data.nugg.activeSwap?.leader?.id,
                                },
                                owner: {
                                    id: x.data.nugg.activeSwap?.owner?.id,
                                },
                                endingEpoch: x.data.nugg.activeSwap?.endingEpoch,
                                num: x.data.nugg.activeSwap?.num,
                            },
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
