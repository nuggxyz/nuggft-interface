/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine } from 'zustand/middleware';
import React from 'react';
import { BigNumber } from '@ethersproject/bignumber';
import { debounce } from 'lodash';

import { useGetAllItemsLazyQuery, useGetAllNuggsLazyQuery } from '@src/gql/types.generated';
import health from '@src/client/health';
import web3 from '@src/web3';
import lib from '@src/lib/index';
import { useXNuggftV1 } from '@src/contracts/useContract';

interface PotentialDataBase extends TokenIdFactoryBase {
    tokenId: TokenId;
    owner: AddressString | NuggId | null;
}

interface PotentialDataBase__Nugg {
    owner: AddressString;
    min: { eth: BigNumber; useMsp: boolean };
}

export interface PotentialDataBase__ItemPreTryout {
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

const useStore = create(
    combine(
        {
            nuggs: [] as NuggId[],
            items: [] as ItemId[],
            nextNuggAmount: 0 as number,
            nextItemAmount: 0 as number,
        },
        (set, get) => {
            function updateNuggs(input: NuggId[], nextAmounter: number, every?: boolean) {
                const { nuggs, nextNuggAmount } = get();

                if (input && nextNuggAmount !== nextAmounter) {
                    if (every) {
                        set(() => ({
                            nuggs: input,
                            nextAmount: nuggs.length,
                        }));
                    } else {
                        set(() => ({
                            nuggs: [...nuggs, ...input],
                            nextAmount: nextAmounter,
                        }));
                    }
                }
            }

            function updateItems(input: ItemId[], nextAmounter: number, every?: boolean) {
                const { items, nextItemAmount } = get();

                if (input && nextItemAmount !== nextAmounter) {
                    if (every) {
                        set(() => ({
                            items: input,
                            nextAmount: items.length,
                        }));
                    } else {
                        set(() => ({
                            items: [...items, ...input],
                            nextAmount: nextAmounter,
                        }));
                    }
                }
            }

            return { updateNuggs, updateItems };
        },
    ),
);

export const usePollNuggs = () => {
    const updateNuggs = useStore((dat) => dat.updateNuggs);

    const len = useStore((dat) => dat.nextNuggAmount);

    const [lazy] = useGetAllNuggsLazyQuery();

    const provider = web3.hook.usePriorityProvider();

    const xnuggft = useXNuggftV1(provider);
    const graphProblem = health.useHealth();

    const callback = React.useCallback(() => {
        const amt = len;
        const backup = () => {
            void xnuggft['tloop()']().then((res) => {
                const tloop = lib.parse.tloop(res);
                void updateNuggs(tloop, tloop.length, true);
            });
        };
        if (!graphProblem) {
            void lazy({ variables: { skip: amt } })
                .then((x) => {
                    if (x.error) {
                        void backup();
                    } else {
                        updateNuggs(x.data?.nuggs.map((y) => y.id.toNuggId()) ?? [], amt + 100);
                    }
                })
                .catch(() => {
                    backup();
                });
        } else {
            backup();
        }
    }, [lazy, updateNuggs, len, graphProblem, xnuggft]);

    const debounced = React.useMemo(() => debounce(callback, 300), [callback]);

    return debounced;
};

export const usePollItems = () => {
    const updateItems = useStore((dat) => dat.updateItems);

    const len = useStore((dat) => dat.nextItemAmount);

    const [lazy] = useGetAllItemsLazyQuery();

    const graphProblem = health.useHealth();

    const provider = web3.hook.usePriorityProvider();

    const xnuggft = useXNuggftV1(provider);

    const callback = React.useCallback(() => {
        const amt = len;
        const backup = () => {
            void xnuggft['iloop()']().then((res) => {
                const iloop = lib.parse.iloop(res);
                void updateItems(iloop, iloop.length, true);
            });
        };
        if (!graphProblem) {
            void lazy({ variables: { skip: amt } })
                .then((x) => {
                    if (x.error) {
                        void backup();
                    } else {
                        updateItems(x.data?.items.map((y) => y.id.toItemId()) ?? [], amt + 100);
                    }
                })
                .catch(() => {
                    void backup();
                });
        } else {
            backup();
        }
    }, [lazy, updateItems, len, graphProblem, xnuggft]);

    const debounced = React.useMemo(() => debounce(callback, 300), [callback]);

    return debounced;
};

export default {
    useStore,
    usePollNuggs,
    usePollItems,

    useNuggs: () => useStore((dat) => dat.nuggs),
    useItems: () => useStore((dat) => dat.items),
};
