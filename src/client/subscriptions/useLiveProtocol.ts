import { BigNumber } from 'ethers';
import React from 'react';

import useDebounce from '@src/hooks/useDebounce';
import { EthInt, Fraction } from '@src/classes/Fraction';
import client from '@src/client';
import { SwapData } from '@src/client/swaps';
import {
    useLiveProtocolSubscription,
    useGetMassiveLiveProtocolQuery,
    LiveProtocolFragment,
} from '@src/gql/types.generated';
import { formatSwapData } from '@src/client/formatters/formatSwapData';

const mergeUnique = <T extends SwapData>(arr: T[]) => {
    let len = arr.length;

    let tmp: number;
    const array3: T[] = [];
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
    const updateProtocolSimple = client.mutate.updateProtocolSimple();

    const updateSwaps = client.swaps.useUpdateSwaps();

    const { data, refetch } = useGetMassiveLiveProtocolQuery({
        fetchPolicy: 'no-cache',
        skip: true,
    });

    const onData = React.useCallback(
        (protocol: LiveProtocolFragment) => {
            if (!protocol) return;

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
                    if (curr.activeSwap) {
                        const d = formatSwapData(
                            curr.activeSwap,
                            curr.activeSwap?.sellingItem.id.toItemId() || '',
                        );
                        if (
                            curr.activeSwap &&
                            protocol.nextEpoch._upcomingActiveItemSwaps.includes(curr.activeSwap.id)
                        ) {
                            // prev.incomingItems.push(data);
                        } else {
                            prev.potentialItems.push(d);
                        }
                    }

                    return prev;
                },
                { potentialItems: [], incomingItems: [] },
            ) as {
                potentialItems: IsolateItemIdFactory<SwapData>[];
                incomingItems: IsolateItemIdFactory<SwapData>[];
            };

            const recentItems = protocol.lastEpoch.itemSwaps.map((z) => {
                return formatSwapData(z, z.sellingItem.id.toItemId());
            });

            const recentSwaps = protocol.lastEpoch.swaps.map((z) => {
                return formatSwapData(z, z.nugg.id.toNuggId());
            });

            const potentialItems = mergeUnique(sortedPotentialItems.potentialItems);
            const activeNuggs = protocol.activeNuggs.reduce(
                (
                    prev: {
                        activeSwaps: IsolateNuggIdFactory<SwapData>[];
                        potentialSwaps: IsolateNuggIdFactory<SwapData>[];
                    },
                    curr,
                ) => {
                    if (curr.activeSwap) {
                        const val = formatSwapData(curr.activeSwap, curr.id.toNuggId());
                        if (!val.endingEpoch) {
                            prev.potentialSwaps.push(val);
                        } else prev.activeSwaps.push(val);
                    }

                    return prev;
                },
                {
                    activeSwaps: [],
                    potentialSwaps: [],
                },
            );

            // protocol.activeItems.forEach((y) => {
            //     updateToken(y.id.toItemId(), formatLiveItem(y));
            // });

            const activeItems = protocol.activeItems.reduce(
                (
                    prev: {
                        activeItems: IsolateItemIdFactory<SwapData>[];
                    },
                    curr,
                ) => {
                    if (curr.activeSwap) {
                        const val = formatSwapData(
                            curr.activeSwap,
                            curr.activeSwap?.sellingItem.id.toItemId() || '',
                        );

                        if (val) prev.activeItems.push(val);
                    }

                    if (curr.upcomingActiveSwap) {
                        const val = formatSwapData(
                            curr.upcomingActiveSwap,
                            curr.upcomingActiveSwap?.sellingItem.id.toItemId() || '',
                        );

                        if (val) prev.activeItems.push(val);
                    }

                    return prev;
                },
                {
                    activeItems: sortedPotentialItems.incomingItems,
                },
            );

            updateSwaps([
                ...recentSwaps,
                ...recentItems,
                ...potentialItems,

                ...Object.values(activeNuggs).flat(),
                ...Object.values(activeItems).flat(),
            ]);
            updateProtocolSimple({
                stake: {
                    staked,
                    shares,
                    eps: EthInt.fromFraction(new Fraction(staked, shares)),
                },
                totalNuggs: Number(protocol.totalNuggs),
                featureTotals: protocol.featureTotals as FixedLengthArray<
                    number,
                    8,
                    typeof protocol.featureTotals
                >,
                // recentSwaps,
                // recentItems,
                // potentialItems,
                // ...activeNuggs,
                // ...activeItems,
            });
        },
        [updateProtocolSimple, updateSwaps],
    );
    const debouncedData = useDebounce(data, 500);

    React.useEffect(() => {
        if (debouncedData?.protocol) onData(debouncedData.protocol);
    }, [debouncedData, onData]);

    const { data: data2 } = useLiveProtocolSubscription({
        shouldResubscribe: true,
        fetchPolicy: 'no-cache',
    });

    const debouncedData2 = useDebounce(data2, 500);

    React.useEffect(() => {
        if (debouncedData2?.protocol) {
            onData(debouncedData2.protocol);

            void refetch({}).then((ayo) => {
                setTimeout(() => {
                    if (ayo.data.protocol) onData(ayo.data.protocol);
                }, 3000);
            });
        }
    }, [debouncedData2, onData, refetch]);

    return null;
};
