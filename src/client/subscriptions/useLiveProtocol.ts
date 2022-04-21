import { BigNumber } from 'ethers';

import { EthInt, Fraction } from '@src/classes/Fraction';
import client from '@src/client';
import { SwapData } from '@src/client/interfaces';
import { useLiveProtocolSubscription } from '@src/gql/types.generated';
import { formatSwapData } from '@src/client/formatters/formatSwapData';

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
    const updateProtocol = client.mutate.updateProtocol();

    useLiveProtocolSubscription({
        shouldResubscribe: true,
        fetchPolicy: 'network-only',
        onSubscriptionData: (x) => {
            if (x.subscriptionData && x.subscriptionData.data && x.subscriptionData.data.protocol) {
                const { protocol } = x.subscriptionData.data;

                const shares = BigNumber.from(protocol.nuggftStakedShares);

                const staked = BigNumber.from(protocol.nuggftStakedEth);

                const sortedPotentialItems = protocol.activeNuggItems.reduce(
                    (
                        prev: {
                            potentialItems: SwapData[];
                            incomingItems: SwapData[];
                        },
                        curr,
                    ) => {
                        const data = formatSwapData(
                            curr.activeSwap,
                            curr.activeSwap?.sellingNuggItem.item.id || '',
                        );
                        if (
                            curr.activeSwap &&
                            protocol.nextEpoch._upcomingActiveItemSwaps.includes(curr.activeSwap.id)
                        ) {
                            // prev.incomingItems.push(data);
                        } else {
                            prev.potentialItems.push(data);
                        }

                        return prev;
                    },
                    { potentialItems: [], incomingItems: [] },
                );

                updateProtocol({
                    stake: {
                        staked,
                        shares,
                        eps: EthInt.fromFraction(new Fraction(staked, shares)),
                    },
                    totalNuggs: Number(protocol.totalNuggs),
                    recentSwaps: protocol.lastEpoch.swaps.map((z) => {
                        return formatSwapData(z, z.nugg.id);
                    }),
                    recentItems: protocol.lastEpoch.itemSwaps.map((z) => {
                        return formatSwapData(z, z.sellingItem.id);
                    }),
                    potentialItems: mergeUnique(sortedPotentialItems.potentialItems),
                    ...protocol.activeNuggs.reduce(
                        (
                            prev: {
                                activeSwaps: SwapData[];
                                potentialSwaps: SwapData[];
                            },
                            curr,
                        ) => {
                            const val = formatSwapData(curr.activeSwap, curr.id || '');
                            if (!val.endingEpoch) {
                                prev.potentialSwaps.push(val);
                            } else prev.activeSwaps.push(val as SwapData);

                            return prev;
                        },
                        {
                            activeSwaps: [],
                            potentialSwaps: [],
                        },
                    ),
                    ...protocol.activeItems.reduce(
                        (
                            prev: {
                                activeItems: SwapData[];
                            },
                            curr,
                        ) => {
                            if (curr.activeSwap) {
                                const val = formatSwapData(
                                    curr.activeSwap,
                                    curr.activeSwap?.sellingItem.id || '',
                                );

                                if (val) prev.activeItems.push(val);
                            }

                            if (curr.upcomingActiveSwap) {
                                const val = formatSwapData(
                                    curr.upcomingActiveSwap,
                                    curr.upcomingActiveSwap?.sellingItem.id || '',
                                );

                                if (val) prev.activeItems.push(val);
                            }

                            return prev;
                        },
                        {
                            activeItems: sortedPotentialItems.incomingItems,
                        },
                    ),
                });
            }
        },
    });

    return null;
};
