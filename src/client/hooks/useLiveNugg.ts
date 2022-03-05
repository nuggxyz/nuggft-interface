import { gql } from '@apollo/client';
import React, { ReactSVG, useEffect } from 'react';

import client from '..';

export type LiveNugg = {
    activeSwap: {
        id: string;
        epoch: {
            id: number;
            startBlock: number;
            endBlock: number;
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
    svg: ReactSVG;
};

export const useLiveNugg = (tokenId: string) => {
    const [nugg, setNugg] = React.useState<LiveNugg>(undefined);

    const apollo = client.live.apollo();

    useEffect(() => {
        if (tokenId) {
            const instance = apollo
                .subscribe<{
                    nugg: {
                        id: string;
                        dotnuggRawCache: string;
                        activeSwap: {
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
                            endingEpoch: number;
                            num: string;
                        };
                    };
                }>({
                    query: gql`
                        subscription useLiveNugg($tokenId: ID!) {
                            nugg(id: $tokenId) {
                                id
                                dotnuggRawCache
                                activeSwap {
                                    id
                                    epoch {
                                        id
                                        startblock
                                        endblock
                                        status
                                    }
                                    eth
                                    leader {
                                        id
                                    }
                                    owner {
                                        id
                                    }
                                    endingEpoch
                                    num
                                }
                            }
                        }
                    `,
                    variables: { tokenId },
                })
                .subscribe((x) => {
                    if (x.data.nugg) {
                        setNugg({
                            activeSwap: {
                                id: x.data.nugg.activeSwap?.id,
                                epoch: {
                                    id: +x.data.nugg.activeSwap?.epoch?.id,
                                    startBlock: +x.data.nugg.activeSwap?.epoch?.startblock,
                                    endBlock: +x.data.nugg.activeSwap?.epoch?.endblock,
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
                            svg: x.data.nugg.dotnuggRawCache as any,
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
