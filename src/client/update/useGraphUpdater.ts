import React from 'react';
import gql from 'graphql-tag';
import { BigNumber } from 'ethers';

import web3 from '@src/web3';
import { EthInt, Fraction } from '@src/classes/Fraction';
import { createItemId, padToAddress } from '@src/lib';
import constants from '@src/lib/constants';
import { ItemId, NuggId } from '@src/client/router';
import client from '@src/client/index';
import { SwapData } from '@src/client/core';

const mergeUnique = (arr: SwapData[]) => {
    let len = arr.length;

    let tmp: number;
    const array3: SwapData[] = [];
    const array5: string[] = [];

    while (len--) {
        const itm = arr[len];
        // eslint-disable-next-line no-cond-assign
        if ((tmp = array5.indexOf(itm.tokenId)) === -1) {
            array3.unshift(itm);
            array5.unshift(itm.tokenId);
        } else if (+array3[tmp].eth < +itm.eth) {
            array3[tmp] = itm;
            array5[tmp] = itm.tokenId;
        }
    }

    return array3;
};

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
                    if (x.data) {
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
                            activeSwaps: x.data.protocol.activeNuggs.map((z) => {
                                return {
                                    id: z.id,
                                    tokenId: z.id,
                                    dotnuggRawCache: z.dotnuggRawCache,
                                    eth: new EthInt(z.activeSwap?.eth),
                                    started: !!z.activeSwap?.endingEpoch,
                                    endingEpoch:
                                        z.activeSwap && z.activeSwap?.endingEpoch
                                            ? Number(z.activeSwap?.endingEpoch)
                                            : 0,
                                    type: 'nugg',
                                    isCurrent: true,
                                };
                            }),
                            activeItems: mergeUnique([
                                ...x.data.protocol.activeItems.map((z) => {
                                    return {
                                        id: createItemId(z.id),
                                        tokenId: createItemId(z.id),
                                        dotnuggRawCache: z.activeSwap.sellingItem.dotnuggRawCache,
                                        eth: new EthInt(z.activeSwap?.eth),
                                        started: !!z.activeSwap.endingEpoch,
                                        sellingNugg: '',
                                        endingEpoch: +z.activeSwap.endingEpoch!,
                                        type: 'item' as const,
                                        isCurrent: true,
                                    };
                                }),
                                ...x.data.protocol.activeNuggItems.map((z) => {
                                    return {
                                        id: createItemId(z.activeSwap.sellingNuggItem.item.id),
                                        tokenId: createItemId(z.activeSwap.sellingNuggItem.item.id),
                                        dotnuggRawCache:
                                            z.activeSwap.sellingNuggItem.item.dotnuggRawCache,
                                        eth: new EthInt(z.activeSwap?.eth),
                                        started: !!z.activeSwap.endingEpoch,
                                        sellingNugg: z.id.split('-')[constants.ITEM_NUGG_POS],
                                        endingEpoch: +z.activeSwap.endingEpoch!,
                                        type: 'item' as const,
                                        isCurrent: true,
                                    };
                                }),
                            ]),
                        });
                    }
                });
            return () => {
                instance.unsubscribe();
            };
        }
        return () => undefined;
    }, [apollo]);

    React.useEffect(() => {
        if (address && apollo) {
            const instance = apollo
                .subscribe<{
                    user: {
                        offers: {
                            id: string;
                            eth: string;
                            swap: {
                                id: string;
                                endingEpoch: string | null;
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
                                    endingEpoch: string | null;
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
                            endingEpoch: string | null;
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
                                nuggs(first: 500, where: { user: $address }) {
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
                    if (x.data && x.data.user)
                        client.actions.updateProtocol({
                            myNuggs: x.data.user.nuggs.map((z) => {
                                return {
                                    tokenId: z.id,
                                    activeLoan: !!z.activeLoan,
                                    activeSwap: !!z.activeSwap,
                                    unclaimedOffers: z.offers.map((y) => {
                                        return {
                                            itemId: y.swap.sellingItem.id,
                                            endingEpoch:
                                                y && y.swap && y.swap.endingEpoch
                                                    ? +y.swap.endingEpoch
                                                    : null,
                                        };
                                    }),
                                };
                            }),
                            myUnclaimedNuggOffers: x.data.user.offers.map((z) => {
                                return {
                                    tokenId: z.swap.nugg.id,
                                    endingEpoch:
                                        z && z.swap && z.swap.endingEpoch
                                            ? +z.swap.endingEpoch
                                            : null,
                                    eth: new EthInt(z.eth),
                                    type: 'nugg',
                                    leader:
                                        z.swap.leader.id.toLowerCase() === address.toLowerCase(),
                                    claimParams: {
                                        address,
                                        tokenId: z.swap.nugg.id,
                                    },
                                };
                            }),
                            myUnclaimedItemOffers: x.data.user.nuggs
                                .map((z) => {
                                    return z.offers.map((y) => {
                                        // console.log(y.swap.sellingItem.id);
                                        return {
                                            tokenId: `item-${y.swap.sellingItem.id}` as ItemId,
                                            endingEpoch:
                                                y && y.swap && y.swap.endingEpoch
                                                    ? +y.swap.endingEpoch
                                                    : null,
                                            eth: new EthInt(y.eth),
                                            type: 'item' as const,
                                            leader: y.swap.leader.id === z.id,
                                            nugg: z.id,
                                            claimParams: {
                                                address: padToAddress(z.id),
                                                tokenId: BigNumber.from(+y.swap.sellingItem.id)
                                                    .shl(24)
                                                    .or(+y.swap.sellingNuggItem.nugg.id)
                                                    .toString(),
                                            },
                                        };
                                    });
                                })
                                .flat(),
                            myLoans: x.data.user.loans.map((z) => {
                                return {
                                    endingEpoch: +z.endingEpoch!,
                                    eth: new EthInt(z.eth),
                                    nugg: z.nugg.id,
                                    startingEpoch: +z.epoch.id,
                                };
                            }),
                        });
                });
            return () => {
                instance.unsubscribe();
            };
        }
        return () => undefined;
    }, [apollo, address]);
    return null;
};
