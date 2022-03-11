import React from 'react';
import { gql } from '@apollo/client';
import { BigNumber } from 'ethers';

import web3 from '@src/web3';
import { EthInt, Fraction } from '@src/classes/Fraction';
import { createItemId } from '@src/lib';
import constants from '@src/lib/constants';
import { padToAddress } from '@src/lib/index';
import { ItemId, NuggId, TokenId } from '@src/client/router';
import client from '@src/client/index';
import { SwapData } from '@src/client/core';

export default () => {
    const address = web3.hook.usePriorityAccount();

    const apollo = client.live.apollo();

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
                                    sellingNugg: x.id.split('-')[constants.ITEM_NUGG_POS],
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

    React.useEffect(() => {
        if (address) {
            const instance = apollo
                .subscribe<{
                    user: {
                        offers: {
                            id: string;
                            eth: string;
                            swap: {
                                id: string;
                                endingEpoch: number;
                                leader: {
                                    id: string;
                                };
                                nugg: {
                                    id: NuggId;
                                };
                            };
                        }[];
                        nuggs: {
                            id: NuggId;
                            activeLoan: { id: string } | undefined;
                            activeSwap: { id: string } | undefined;
                            offers: {
                                id: string;
                                eth: string;
                                swap: {
                                    endingEpoch: string;
                                    sellingItem: { id: ItemId };
                                    sellingNuggItem: {
                                        nugg: {
                                            id: NuggId;
                                        };
                                    };
                                    leader: {
                                        id: string;
                                    };
                                };
                            }[];
                        }[];
                        loans: {
                            id: string;
                            endingEpoch: string;
                            eth: string;
                            nugg: {
                                id: NuggId;
                            };
                            epoch: {
                                id: string;
                            };
                        }[];
                    };
                }>({
                    query: gql`
                        subscription useLiveUser($address: ID!) {
                            user(id: $address) {
                                offers(where: { claimed: false }) {
                                    id
                                    eth
                                    swap {
                                        id
                                        nugg {
                                            id
                                        }
                                        leader {
                                            id
                                        }
                                        endingEpoch
                                    }
                                }
                                loans {
                                    id
                                    endingEpoch
                                    eth
                                    nugg {
                                        id
                                    }
                                    epoch {
                                        id
                                    }
                                }
                                nuggs(where: { user: $address }) {
                                    id
                                    activeLoan {
                                        id
                                    }
                                    activeSwap {
                                        id
                                    }
                                    offers(where: { claimed: false }) {
                                        id
                                        eth
                                        swap {
                                            id
                                            sellingItem {
                                                id
                                            }
                                            sellingNuggItem {
                                                id
                                                nugg {
                                                    id
                                                }
                                            }
                                            leader {
                                                id
                                            }
                                            endingEpoch
                                        }
                                    }
                                }
                            }
                        }
                    `,
                    variables: { address: address.toLowerCase() },
                })
                .subscribe((x) => {
                    client.actions.updateProtocol({
                        myNuggs: x.data.user.nuggs.map((x) => {
                            return {
                                tokenId: x.id,
                                activeLoan: !!x.activeLoan,
                                activeSwap: !!x.activeSwap,
                                unclaimedOffers: x.offers.map((y) => {
                                    return {
                                        itemId: y.swap.sellingItem.id,
                                        endingEpoch: +y.swap.endingEpoch,
                                    };
                                }),
                            };
                        }),
                        myUnclaimedNuggOffers: x.data.user.offers.map((x) => {
                            return {
                                tokenId: x.swap.nugg.id,
                                endingEpoch: +x.swap.endingEpoch,
                                eth: new EthInt(x.eth),
                                type: 'nugg',
                                leader: x.swap.leader.id.toLowerCase() === address.toLowerCase(),
                                claimParams: {
                                    address,
                                    tokenId: x.swap.nugg.id,
                                },
                            };
                        }),
                        myUnclaimedItemOffers: x.data.user.nuggs
                            .map((x) => {
                                return x.offers.map((y) => {
                                    // console.log(y.swap.sellingItem.id);
                                    return {
                                        tokenId: ('item-' + y.swap.sellingItem.id) as ItemId,
                                        endingEpoch: +y.swap.endingEpoch,
                                        eth: new EthInt(y.eth),
                                        type: 'item' as 'item',
                                        leader: y.swap.leader.id === x.id,
                                        nugg: x.id,
                                        claimParams: {
                                            address: padToAddress(x.id),
                                            tokenId: BigNumber.from(+y.swap.sellingItem.id)
                                                .shl(24)
                                                .or(+y.swap.sellingNuggItem.nugg.id)
                                                .toString(),
                                        },
                                    };
                                });
                            })
                            .flat(),
                        myLoans: x.data.user.loans.map((x) => {
                            return {
                                endingEpoch: +x.endingEpoch,
                                eth: new EthInt(x.eth),
                                nugg: x.nugg.id,
                                startingEpoch: +x.epoch.id,
                            };
                        }),
                    });
                });
            return () => {
                instance.unsubscribe();
            };
        }
    }, [apollo, address]);
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
