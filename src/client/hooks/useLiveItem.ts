import { gql } from '@apollo/client';
import React, { ReactSVG, useEffect } from 'react';

import { extractItemId } from '@src/lib';

import client from '..';

export type LiveItem = {
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

export const useLiveItem = (tokenId: string) => {
    const [item, setItem] = React.useState<LiveItem>(undefined);

    const apollo = client.live.apollo();

    useEffect(() => {
        if (tokenId) {
            const instance = apollo
                .subscribe<{
                    item: {
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
                        subscription useLiveItem($tokenId: ID!) {
                            item(id: $tokenId) {
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
                    variables: { tokenId: extractItemId(tokenId) },
                })
                .subscribe((x) => {
                    console.log({ x });
                    if (x.data.item) {
                        setItem({
                            activeSwap: {
                                id: x.data.item.activeSwap?.id,
                                epoch: {
                                    id: +x.data.item.activeSwap?.epoch?.id,
                                    startBlock: +x.data.item.activeSwap?.epoch?.startblock,
                                    endBlock: +x.data.item.activeSwap?.epoch?.endblock,
                                    status: x.data.item.activeSwap?.epoch?.status,
                                },
                                eth: x.data.item.activeSwap?.eth,
                                leader: {
                                    id: x.data.item.activeSwap?.leader?.id,
                                },
                                owner: {
                                    id: x.data.item.activeSwap?.owner?.id,
                                },
                                endingEpoch: x.data.item.activeSwap?.endingEpoch,
                                num: x.data.item.activeSwap?.num,
                            },
                            svg: x.data.item.dotnuggRawCache as any,
                        });
                    }
                });
            return () => {
                instance.unsubscribe();
            };
        }
    }, [apollo, tokenId]);

    return item;
};
