/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine } from 'zustand/middleware';
import React from 'react';
import { QueryResult } from '@apollo/client';
import { BigNumber } from '@ethersproject/bignumber';
import shallow from 'zustand/shallow';
import { debounce } from 'lodash';

import { GetV2PotentialQuery, useGetV2PotentialLazyQuery } from '@src/gql/types.generated';
import { buildTokenIdFactory } from '@src/prototypes';
import { MIN_SALE_PRICE } from '@src/web3/constants';

interface PotentialDataBase extends TokenIdFactoryBase {
    tokenId: TokenId;
    owner: AddressString | NuggId | null;
}

interface PotentialDataBase__Nugg {
    owner: AddressString;
    min: { eth: BigNumber; useMsp: boolean };
}

interface PotentialDataBase__ItemPreTryout {
    owner: NuggId;
    top: BigNumber;
    swapId: number;
}

interface PotentialDataBase__Item {
    owner: null;

    count: number;
    min: { nugg: NuggId; eth: BigNumber; useMsp: boolean } | null;
    max: { nugg: NuggId; eth: BigNumber; useMsp: boolean } | null;
    swaps: { nugg: NuggId; eth: BigNumber; useMsp: boolean }[];
}

export type PotentialData = TokenIdFactoryCreator<
    PotentialDataBase,
    PotentialDataBase__Nugg,
    PotentialDataBase__Item
>;

const formatTryout = (tokenId: ItemId, input: PotentialDataBase__ItemPreTryout[]) => {
    const res = input.reduce(
        (
            prev: {
                count: number;
                min: { nugg: NuggId; eth: BigNumber; useMsp: boolean } | null;
                max: { nugg: NuggId; eth: BigNumber; useMsp: boolean } | null;
                swaps: { nugg: NuggId; eth: BigNumber; useMsp: boolean }[];
            },
            curr,
        ) => {
            const swap = {
                nugg: curr.owner as NuggId,
                eth: curr.top,
                useMsp: false,
            };

            if (!prev) {
                return {
                    min: swap,
                    max: swap,
                    count: 1,
                    swaps: [swap],
                };
            }

            return {
                min: !prev.min || prev.min.eth.gt(curr.top) ? swap : prev.min,
                max: !prev.max || prev.max.eth.lt(curr.top) ? swap : prev.max,
                count: prev.count + 1,
                swaps: [swap, ...prev.swaps].sort((a, b) => (a.eth.gt(b.eth) ? 1 : -1)),
            };
        },
        { count: 0, min: null, max: null, swaps: [] },
    );
    return buildTokenIdFactory({
        tokenId,
        owner: null,
        ...res,
    });
};

const formatter = (
    input: QueryResult<GetV2PotentialQuery, unknown>['data'],
    hits: TokenIdDictionary<PotentialData>,
    // block: number,
): [TokenId[]] => {
    const res: PotentialData[] = [];
    input?.items.forEach((a) => {
        const splt = a.id.split('-');
        const tokenId = Number(splt[0]).toItemId();

        const tryouts: PotentialDataBase__ItemPreTryout[] = [];
        a?.swaps.forEach((b) => {
            const val = buildTokenIdFactory({
                owner: b.owner!.id.toNuggId(),
                swapId: Number(splt[1]),
                top: b.top === '0' ? MIN_SALE_PRICE : BigNumber.from(b.top),
                tokenId,
            });

            tryouts.push(val);
        });
        const val = formatTryout(a.id.toItemId(), tryouts);
        if (val.count > 0) {
            res.push(val);
            hits[tokenId] = val;
        }
    });

    input?.nuggs.forEach((a) => {
        const splt = a.id.split('-');
        const tokenId = Number(splt[0]).toNuggId();

        const val = buildTokenIdFactory({
            owner: a.activeSwap?.owner!.id as AddressString,
            swapId: Number(splt[1]),
            min: {
                eth: BigNumber.from(a.activeSwap?.top),
                useMsp: !a.activeSwap?.top || a.activeSwap.top === '0',
            },
            tokenId,
        });

        res.push(val);
        hits[tokenId] = val;
    });

    return [res.sort((a, b) => (a?.min?.eth.lt(b?.min?.eth || 0) ? -1 : 1)).map((a) => a.tokenId)];
};

const useStore = create(
    combine(
        {
            v3: {
                hits: {} as TokenIdDictionary<PotentialData>,
                all: [] as TokenId[],
                nextAmount: 0,
            },
        },
        (set, get) => {
            function handleV3(input: QueryResult<GetV2PotentialQuery, any>, nextAmounter: number) {
                const dat = input.data;
                const { hits, all, nextAmount } = get().v3;

                if (dat && nextAmount !== nextAmounter) {
                    const [all2] = formatter(dat, hits);
                    set(() => ({
                        v3: {
                            all: [...all, ...all2],
                            hits,
                            nextAmount: nextAmounter,
                        },
                    }));
                }

                console.log(get().v3);
            }

            return { handleV3 };
        },
    ),
);

export const usePollV3 = () => {
    const handleV3 = useStore((dat) => dat.handleV3);

    const len = useStore((dat) => dat.v3.nextAmount);

    const [lazy] = useGetV2PotentialLazyQuery();

    const callback = React.useCallback(() => {
        const amt = len;
        void lazy({ variables: { skip: amt } }).then((x) => handleV3(x, amt + 100));
    }, [lazy, handleV3, len]);

    const debounced = React.useMemo(() => debounce(callback, 300), [callback]);

    return debounced;
};

export default {
    useStore,
    usePollV3,

    useSwap: <A extends TokenId>(tokenId: A | undefined) => {
        return useStore(
            React.useCallback(
                (state) => (tokenId !== undefined ? state.v3.hits[tokenId] : undefined),
                [tokenId],
            ),
            shallow,
        );
    },

    useSwapList: () =>
        useStore((s) => {
            return s.v3.all;
        }),
};
