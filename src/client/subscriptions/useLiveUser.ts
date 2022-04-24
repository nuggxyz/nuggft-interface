import { useEffect } from 'react';

import web3 from '@src/web3';
import { EthInt } from '@src/classes/Fraction';
import client from '@src/client';
import { useLiveUserSubscription } from '@src/gql/types.generated';
import { Address } from '@src/classes/Address';
import { buildTokenIdFactory } from '@src/prototypes';

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
        skip: !address,
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
                            tokenId: z.id.toNuggId(),
                            activeLoan: !!z.activeLoan,
                            activeSwap: !!z.activeSwap,
                            pendingClaim: z.pendingClaim,
                            lastTransfer: z.lastTransfer,
                            unclaimedOffers: z.offers.map((y) => {
                                return {
                                    itemId: y.swap.sellingItem.id.toItemId(),
                                    eth: y.eth,
                                    sellingNuggId: y.swap.sellingNuggItem.nugg.id.toNuggId(),
                                    endingEpoch:
                                        y && y.swap && y.swap.endingEpoch
                                            ? Number(y.swap.endingEpoch)
                                            : null,
                                };
                            }),
                        };
                    }),
                    myUnclaimedNuggOffers: user.offers.map((z) => {
                        return buildTokenIdFactory({
                            tokenId: z.swap.nugg.id.toNuggId(),
                            endingEpoch:
                                z && z.swap && z.swap.endingEpoch
                                    ? Number(z.swap.endingEpoch)
                                    : null,
                            eth: new EthInt(z.eth),
                            leader: z.swap.leader.id.toLowerCase() === address.toLowerCase(),
                            claimParams: {
                                address: address as AddressString,
                                sellingTokenId: z.swap.nugg.id.toNuggId(),
                                itemId: 'item-0',
                                buyingTokenId: 'nugg-0',
                            },
                            nugg: null,
                        });
                    }),
                    myUnclaimedItemOffers: user.nuggs
                        .map((z) => {
                            return z.offers.map((y) => {
                                return buildTokenIdFactory({
                                    tokenId: y.swap.sellingItem.id.toItemId(),
                                    endingEpoch:
                                        y && y.swap && y.swap.endingEpoch
                                            ? Number(y.swap.endingEpoch)
                                            : null,
                                    eth: new EthInt(y.eth),
                                    leader: y.swap.leader?.id === z.id,
                                    nugg: z.id.toNuggId(),
                                    claimParams: {
                                        itemId: y.swap.sellingItem.id.toItemId(),
                                        buyingTokenId: z.id.toNuggId(),
                                        sellingTokenId: y.swap.sellingNuggItem.nugg.id.toNuggId(),
                                        address: Address.ZERO.hash as AddressStringZero,
                                    },
                                });
                            });
                        })
                        .flat(),
                    myLoans: user.loans.map((z) => {
                        return {
                            endingEpoch: Number(z.endingEpoch),
                            eth: new EthInt(z.eth),
                            nugg: z.nugg.id.toNuggId(),
                            startingEpoch: +z.epoch.id,
                        };
                    }),
                });
            }
        },
    });
    return null;
};
