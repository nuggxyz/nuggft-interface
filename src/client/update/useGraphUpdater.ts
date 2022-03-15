import React from 'react';
import { BigNumber } from 'ethers';

import web3 from '@src/web3';
import { EthInt, Fraction } from '@src/classes/Fraction';
import { createItemId, padToAddress } from '@src/lib';
import constants from '@src/lib/constants';
import { ItemId } from '@src/client/router';
import client from '@src/client/index';
import { SwapData } from '@src/client/interfaces';
import {
    LiveProtocolDocument,
    LiveProtocolSubscription,
    LiveUserSubscription,
    LiveUserDocument,
} from '@src/gql/types.generated';

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
                .subscribe<LiveProtocolSubscription>({
                    query: LiveProtocolDocument,
                    variables: {},
                    fetchPolicy: 'standby',
                })
                .subscribe((x) => {
                    if (x.data && x.data.protocol) {
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
                                startblock: Number(x.data.protocol.epoch.startblock),
                                endblock: Number(x.data.protocol.epoch.endblock),
                                status: x.data.protocol.epoch.status,
                            },
                            activeSwaps: x.data.protocol.activeNuggs.map((z) => {
                                return {
                                    id: z.id,
                                    tokenId: z.id,
                                    // dotnuggRawCache: z.dotnuggRawCache,
                                    eth: new EthInt(z.activeSwap!.eth),
                                    started: !!z.activeSwap?.endingEpoch,
                                    endingEpoch:
                                        z.activeSwap && z.activeSwap?.endingEpoch
                                            ? Number(z.activeSwap?.endingEpoch)
                                            : 0,
                                    type: 'nugg',
                                    isCurrent: true,
                                    dotnuggRawCache: null,
                                };
                            }),
                            activeItems: mergeUnique([
                                ...x.data.protocol.activeItems.map((z) => {
                                    return {
                                        id: createItemId(z.id),
                                        tokenId: createItemId(z.id),
                                        // dotnuggRawCache: z.activeSwap.sellingItem.dotnuggRawCache,
                                        eth: new EthInt(z.activeSwap!.eth),
                                        started: !!z.activeSwap!.endingEpoch,
                                        sellingNugg: '',
                                        endingEpoch: Number(z.activeSwap!.endingEpoch),
                                        type: 'item' as const,
                                        isCurrent: true,
                                        dotnuggRawCache: null,
                                    };
                                }),
                                ...x.data.protocol.activeNuggItems.map((z) => {
                                    return {
                                        id: createItemId(z.activeSwap!.sellingNuggItem.item.id),
                                        tokenId: createItemId(
                                            z.activeSwap!.sellingNuggItem.item.id,
                                        ),
                                        // dotnuggRawCache:
                                        //     z.activeSwap!.sellingNuggItem.item.dotnuggRawCache,
                                        eth: new EthInt(z.activeSwap!.eth),
                                        started: !!z.activeSwap!.endingEpoch,
                                        sellingNugg: z.id.split('-')[constants.ITEM_NUGG_POS],
                                        endingEpoch: Number(z.activeSwap!.endingEpoch),
                                        type: 'item' as const,
                                        isCurrent: true,
                                        dotnuggRawCache: null,
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
                .subscribe<LiveUserSubscription>({
                    query: LiveUserDocument,
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
                                            itemId: y.swap.sellingItem.id as ItemId,
                                            endingEpoch:
                                                y && y.swap && y.swap.endingEpoch
                                                    ? Number(y.swap.endingEpoch)
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
                                            ? Number(z.swap.endingEpoch)
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
                                        return {
                                            tokenId: `item-${y.swap.sellingItem.id}` as ItemId,
                                            endingEpoch:
                                                y && y.swap && y.swap.endingEpoch
                                                    ? Number(y.swap.endingEpoch)
                                                    : null,
                                            eth: new EthInt(y.eth),
                                            type: 'item' as const,
                                            leader: y.swap.leader?.id === z.id,
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
                                    endingEpoch: Number(z.endingEpoch),
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
