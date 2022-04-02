import { BigNumber } from 'ethers';
import { useEffect } from 'react';

import web3 from '@src/web3';
import { EthInt } from '@src/classes/Fraction';
import { padToAddress } from '@src/lib';
import { ItemId } from '@src/client/router';
import client from '@src/client';
import { useLiveUserSubscription } from '@src/gql/types.generated';

export default () => {
    const address = web3.hook.usePriorityAccount();

    const graph = client.live.graph();

    const updateProtocol = client.mutate.updateProtocol();

    // clean up on account change
    useEffect(() => {
        return () => {
            updateProtocol({
                myNuggs: [],
                myLoans: [],
                myUnclaimedItemOffers: [],
                myUnclaimedNuggOffers: [],
            });
        };
    }, [address]);

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
                                    eth: y.eth,
                                    sellingNuggId: y.swap.sellingNuggItem.nugg.id,
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
