import React from 'react';
import { gql } from '@apollo/client';
import { BigNumber } from 'ethers';

import web3 from '@src/web3';
import { EthInt, Fraction } from '@src/classes/Fraction';
import { createItemId } from '@src/lib';

import { SwapData } from './core';
import { useBlockUpdater } from './update/useBlockUpdater';
import { TokenId } from './router';
import { useLiveOffers } from './hooks/useLiveOffers';

import client from './index';

export default () => {
    const chainId = web3.hook.usePriorityChainId();

    const apollo = client.live.apollo();
    const infura = client.live.infura();

    const lastSwap__tokneId = client.live.lastSwap__tokenId();

    useBlockUpdater();

    useLiveOffers(lastSwap__tokneId);

    React.useEffect(() => {
        if (apollo) {
            const instance = apollo
                .subscribe<{
                    protocol: {
                        epoch: {
                            id: string;
                            startBlock: string;
                            endBlock: string;
                            status: 'OVER' | 'ACTIVE' | 'PENDING';
                        };
                        nuggftStakedEth: string;
                        nuggftStakedShares: string;
                        activeNuggs: {
                            id: string;
                            dotnuggRawCache: Base64EncodedSvg;
                            activeSwap: {
                                eth: string;
                                endingEpoch: string | null;
                            };
                        }[];
                        activeNuggItems: {
                            id: string;
                            activeSwap: {
                                sellingNuggItem: {
                                    item: {
                                        id: string;
                                        dotnuggRawCache: Base64EncodedSvg;
                                    };
                                };
                                eth: string;
                                endingEpoch: string | null;
                            };
                        }[];
                        activeItems: {
                            id: string;
                            activeSwap: {
                                sellingItem: {
                                    dotnuggRawCache: Base64EncodedSvg;
                                };
                                eth: string;
                                endingEpoch: string | null;
                            };
                        }[];
                    };
                }>({
                    query: gql`
                        subscription useLiveProtocol {
                            protocol(id: "0x42069") {
                                id
                                epoch {
                                    id
                                    status
                                    startblock
                                    endblock
                                }
                                nuggftStakedEth
                                nuggftStakedShares
                                activeNuggs(orderBy: idnum) {
                                    id
                                    # dotnuggRawCache
                                    activeSwap {
                                        id
                                        eth
                                        endingEpoch
                                    }
                                }
                                activeNuggItems {
                                    id
                                    activeSwap {
                                        id
                                        sellingNuggItem {
                                            id
                                            item {
                                                id
                                                # dotnuggRawCache
                                            }
                                        }
                                        eth
                                        endingEpoch
                                    }
                                }
                                activeItems {
                                    id
                                    activeSwap {
                                        id
                                        sellingItem {
                                            id
                                            # dotnuggRawCache
                                        }
                                        eth
                                        endingEpoch
                                    }
                                }
                            }
                        }
                    `,
                    variables: {},
                    fetchPolicy: 'standby',
                })
                .subscribe((x) => {
                    const shares = BigNumber.from(x.data.protocol.nuggftStakedShares);

                    const staked = BigNumber.from(x.data.protocol.nuggftStakedEth);

                    client.actions.updateProtocol({
                        stake: {
                            staked,
                            shares,
                            eps: EthInt.fromFraction(new Fraction(staked, shares)),
                        },
                        epoch: {
                            id: +x.data.protocol.epoch.id,
                            startblock: +x.data.protocol.epoch.startBlock,
                            endblock: +x.data.protocol.epoch.endBlock,
                            status: x.data.protocol.epoch.status,
                        },
                        activeSwaps: x.data.protocol.activeNuggs.map((x) => {
                            return {
                                id: x.id as TokenId,
                                tokenId: x.id as TokenId,
                                dotnuggRawCache: x.dotnuggRawCache,
                                eth: new EthInt(x.activeSwap?.eth),
                                started: !!x.activeSwap?.endingEpoch,
                                endingEpoch: +x.activeSwap?.endingEpoch,
                                type: 'nugg',
                            };
                        }),
                        activeItems: mergeUnique([
                            ...x.data.protocol.activeItems.map((x) => {
                                return {
                                    id: createItemId(x.id) as TokenId,
                                    tokenId: createItemId(x.id) as TokenId,
                                    dotnuggRawCache: x.activeSwap.sellingItem.dotnuggRawCache,
                                    eth: new EthInt(x.activeSwap?.eth),
                                    started: !!x.activeSwap.endingEpoch,
                                    sellingNugg: '',
                                    endingEpoch: +x.activeSwap?.endingEpoch,
                                    type: 'item' as 'item',
                                };
                            }),
                            ...x.data.protocol.activeNuggItems.map((x) => {
                                return {
                                    id: createItemId(
                                        x.activeSwap.sellingNuggItem.item.id,
                                    ) as TokenId,
                                    tokenId: createItemId(
                                        x.activeSwap.sellingNuggItem.item.id,
                                    ) as TokenId,
                                    dotnuggRawCache:
                                        x.activeSwap.sellingNuggItem.item.dotnuggRawCache,
                                    eth: new EthInt(x.activeSwap?.eth),
                                    started: !!x.activeSwap.endingEpoch,
                                    sellingNugg: x.id.split('-')[0],
                                    endingEpoch: +x.activeSwap?.endingEpoch,
                                    type: 'item' as 'item',
                                };
                            }),
                        ]),
                    });
                });
            return () => {
                instance.unsubscribe();
            };
        }
    }, [apollo]);

    return null;
};

const mergeUnique = (arr: SwapData[]) => {
    let len = arr.length;

    let tmp: number;
    let array3: SwapData[] = [];
    let array5: string[] = [];

    while (len--) {
        let itm = arr[len];
        if ((tmp = array5.indexOf(itm.tokenId)) === -1) {
            array3.unshift(itm);
            array5.unshift(itm.tokenId);
        } else {
            if (+array3[tmp].eth < +itm.eth) {
                array3[tmp] = itm;
                array5[tmp] = itm.tokenId;
            }
        }
    }

    return array3;
};
