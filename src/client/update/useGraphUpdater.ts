import { BigNumber } from 'ethers';

import web3 from '@src/web3';
import { EthInt, Fraction } from '@src/classes/Fraction';
import { createItemId, padToAddress } from '@src/lib';
import constants from '@src/lib/constants';
import { ItemId } from '@src/client/router';
import client from '@src/client/index';
import { ListDataTypes, SwapData } from '@src/client/interfaces';
import { useLiveProtocolSubscription, useLiveUserSubscription } from '@src/gql/types.generated';

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

    const graph = client.live.graph();

    const updateProtocol = client.mutate.updateProtocol();

    useLiveProtocolSubscription({
        client: graph,
        shouldResubscribe: true,
        fetchPolicy: 'cache-first',
        onSubscriptionData: (x) => {
            if (x.subscriptionData && x.subscriptionData.data && x.subscriptionData.data.protocol) {
                const { protocol } = x.subscriptionData.data;

                const shares = BigNumber.from(protocol.nuggftStakedShares);

                const staked = BigNumber.from(protocol.nuggftStakedEth);

                updateProtocol({
                    stake: {
                        staked,
                        shares,
                        eps: EthInt.fromFraction(new Fraction(staked, shares)),
                    },
                    epoch: {
                        id: +protocol.epoch.id,
                        startblock: Number(protocol.epoch.startblock),
                        endblock: Number(protocol.epoch.endblock),
                        status: protocol.epoch.status,
                    },
                    activeSwaps: protocol.activeNuggs.map((z) => {
                        return {
                            id: z.id,
                            tokenId: z.id,
                            eth: new EthInt(z.activeSwap!.eth),
                            started: !!z.activeSwap?.endingEpoch,
                            endingEpoch:
                                z.activeSwap && z.activeSwap?.endingEpoch
                                    ? Number(z.activeSwap?.endingEpoch)
                                    : 0,
                            type: 'nugg',
                            isCurrent: true,
                            dotnuggRawCache: undefined,
                            listDataType: ListDataTypes.Swap,
                        };
                    }),
                    activeItems: mergeUnique([
                        ...protocol.activeItems.map((z) => {
                            return {
                                id: createItemId(z.id),
                                tokenId: createItemId(z.id),
                                eth: new EthInt(z.activeSwap!.eth),
                                started: !!z.activeSwap!.endingEpoch,
                                sellingNugg: '',
                                endingEpoch: Number(z.activeSwap!.endingEpoch),
                                type: 'item' as const,
                                isCurrent: true,
                                dotnuggRawCache: undefined,
                                listDataType: ListDataTypes.Swap as const,
                            };
                        }),
                        ...protocol.activeNuggItems.map((z) => {
                            return {
                                id: createItemId(z.activeSwap!.sellingNuggItem.item.id),
                                tokenId: createItemId(z.activeSwap!.sellingNuggItem.item.id),
                                eth: new EthInt(z.activeSwap!.eth),
                                started: !!z.activeSwap!.endingEpoch,
                                sellingNugg: z.id.split('-')[constants.ITEM_NUGG_POS],
                                endingEpoch: Number(z.activeSwap!.endingEpoch),
                                type: 'item' as const,
                                isCurrent: true,
                                dotnuggRawCache: undefined,
                                listDataType: ListDataTypes.Swap as const,
                            };
                        }),
                    ]),
                });
            }
        },
    });

    useLiveUserSubscription({
        client: graph,
        variables: { address: address ? address.toLowerCase() : '' },
        shouldResubscribe: true,
        fetchPolicy: 'network-only',
        onSubscriptionData: (x) => {
            if (
                address &&
                x.subscriptionData &&
                x.subscriptionData.data &&
                x.subscriptionData.data.user
            ) {
                const { user } = x.subscriptionData.data;
                updateProtocol({
                    myNuggs: user.nuggs.map((z) => {
                        return {
                            recent: false,
                            tokenId: z.id,
                            activeLoan: !!z.activeLoan,
                            activeSwap: !!z.activeSwap,
                            pendingClaim: z.pendingClaim,
                            lastTransfer: z.lastTransfer,
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
                    myUnclaimedNuggOffers: user.offers.map((z) => {
                        return {
                            tokenId: z.swap.nugg.id,
                            endingEpoch:
                                z && z.swap && z.swap.endingEpoch
                                    ? Number(z.swap.endingEpoch)
                                    : null,
                            eth: new EthInt(z.eth),
                            type: 'nugg',
                            leader: z.swap.leader.id.toLowerCase() === address.toLowerCase(),
                            claimParams: {
                                address,
                                tokenId: z.swap.nugg.id,
                            },
                        };
                    }),
                    myUnclaimedItemOffers: user.nuggs
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
                    myLoans: user.loans.map((z) => {
                        return {
                            endingEpoch: Number(z.endingEpoch),
                            eth: new EthInt(z.eth),
                            nugg: z.nugg.id,
                            startingEpoch: +z.epoch.id,
                        };
                    }),
                });
            }
        },
    });

    return null;
};
