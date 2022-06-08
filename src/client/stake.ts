/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine } from 'zustand/middleware';
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';
import React from 'react';
import { QueryResult } from '@apollo/client';

import { EthInt, Fraction } from '@src/classes/Fraction';
import { calculateMsp } from '@src/web3/config';
import { GetV2ActiveQuery } from '@src/gql/types.generated';

const store = create(
    combine(
        {
            shares: BigNumber.from(0),
            eth: BigNumber.from(0),
            totalNuggs: 0,
            featureTotals: [0, 0, 0, 0, 0, 0, 0, 0] as FixedLengthArray<number, 8>,
        },
        (set, get) => {
            const update = (
                shares: BigNumber,
                eth: BigNumber,
                totalNuggs?: number,
                featureTotals?: FixedLengthArray<number, 8>,
            ) => {
                if (get().eth.lte(eth)) {
                    set(() => {
                        return {
                            shares,
                            eth,
                        };
                    });
                }
                if (totalNuggs) {
                    set(() => {
                        return {
                            totalNuggs,
                        };
                    });
                }

                if (featureTotals) {
                    set(() => {
                        return {
                            featureTotals,
                        };
                    });
                }
            };

            const handleActiveV2 = (
                input: QueryResult<
                    GetV2ActiveQuery,
                    Exact<{
                        [key: string]: never;
                    }>
                >,
            ) => {
                if (input.data?.protocol) {
                    const { nuggftStakedShares, nuggftStakedEth, featureTotals, totalNuggs } =
                        input.data.protocol;

                    update(
                        BigNumber.from(nuggftStakedShares),
                        BigNumber.from(nuggftStakedEth),
                        Number(totalNuggs),
                        featureTotals as unknown as FixedLengthArray<number, 8>,
                    );
                }
            };

            return { update, handleActiveV2 };
        },
    ),
);

export default {
    useShares: () => store((draft) => draft.shares),
    useTotalNuggs: () => store((draft) => draft.totalNuggs),
    useFeatureTotals: () => store((draft) => draft.featureTotals),

    useEth: () => store((draft) => draft.eth),
    useUpdate: () => store((draft) => draft.update),
    useHandleActiveV2: () => store((draft) => draft.handleActiveV2),

    useEps: () => {
        const eth = store((draft) => draft.eth);
        const shares = store((draft) => draft.shares);
        return React.useMemo(() => {
            return EthInt.fromFraction(new Fraction(eth, shares));
        }, [eth, shares]);
    },
    useMsp: () => {
        const eth = store((draft) => draft.eth);
        const shares = store((draft) => draft.shares);
        return React.useMemo(() => {
            return calculateMsp(shares, eth);
        }, [eth, shares]);
    },
    ...store,
};
