import { gql } from '@apollo/client';
import React, { useEffect } from 'react';

import constants from '@src/lib/constants';

import client from '..';

import { LiveSwap, swapgql } from './useLiveNugg';

export interface LiveItem {
    type: 'item';
    activeSwap: LiveSwap;
    // svg: ReactSVG;
    swaps: LiveSwap[];
    count: number;
}

export const useLiveItem = (tokenId: string) => {
    const [item, setItem] = React.useState<LiveItem>(undefined);

    const apollo = client.live.apollo();

    useEffect(() => {
        if (tokenId) {
            const instance = apollo
                .subscribe<{
                    item: {
                        id: string;
                        count: number;
                        // dotnuggRawCache: string;
                        activeSwap: LiveSwap;
                        swaps: LiveSwap[];
                    };
                }>({
                    query: gql`
                        subscription useLiveItem($tokenId: ID!) {
                            item(id: $tokenId) {
                                id
                                count
                                # dotnuggRawCache
                                activeSwap ${swapgql('item')}
                                swaps ${swapgql('item')}
                            }
                        }
                    `,
                    variables: { tokenId: tokenId.replace(constants.ID_PREFIX_ITEM, '') },
                })
                .subscribe((x) => {
                    console.log({ x });
                    if (x.data.item) {
                        setItem({
                            type: 'item',
                            count: x.data.item.count,
                            swaps: x.data.item.swaps.map((y) => {
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
                                id: x.data.item.activeSwap?.id,
                                epoch: {
                                    id: +x.data.item.activeSwap?.epoch?.id,
                                    startblock: +x.data.item.activeSwap?.epoch?.startblock,
                                    endblock: +x.data.item.activeSwap?.epoch?.endblock,
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
                            // svg: x.data.item.dotnuggRawCache as any,
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
