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
import { XNuggftV1 } from '@src/typechain';

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

                if (input && nextNuggAmount < nextAmounter) {
                    if (every) {
                        set(() => ({
                            nuggs: input,
                            nextNuggAmount: nuggs.length,
                        }));
                    } else {
                        set(() => ({
                            nuggs: [...nuggs, ...input],
                            nextNuggAmount: nextAmounter,
                        }));
                    }
                }
            }

            function updateItems(input: ItemId[], nextAmounter: number, every?: boolean) {
                const { items, nextItemAmount } = get();

                if (input && nextItemAmount < nextAmounter) {
                    if (every) {
                        set(() => ({
                            items: input,
                            nextItemAmount: items.length,
                        }));
                    } else {
                        set(() => ({
                            items: [...items, ...input],
                            nextItemAmount: nextAmounter,
                        }));
                    }
                }
            }

            async function backupItems(xnuggft: XNuggftV1) {
                return xnuggft['iloop()']().then((res) => {
                    const iloop = lib.parse.iloop(res);
                    console.log({ iloop });
                    updateItems(iloop, iloop.length, true);
                });
            }

            async function backupNuggs(xnuggft: XNuggftV1) {
                return xnuggft['tloop()']().then((res) => {
                    const tloop = lib.parse.tloop(res);
                    console.log({ tloop });

                    void updateNuggs(tloop, tloop.length, true);
                });
            }

            return { updateNuggs, updateItems, backupItems, backupNuggs };
        },
    ),
);

export const usePollNuggs = () => {
    const updateNuggs = useStore((dat) => dat.updateNuggs);
    const backup = useStore((dat) => dat.backupNuggs);

    const len = useStore((dat) => dat.nextNuggAmount);

    const [lazy] = useGetAllNuggsLazyQuery();

    const provider = web3.hook.usePriorityProvider();

    const xnuggft = useXNuggftV1(provider);
    const graphProblem = health.useHealth();

    const callback = React.useCallback(() => {
        const amt = len;

        if (!graphProblem) {
            void lazy({ variables: { skip: amt } })
                .then((x) => {
                    if (x.error) {
                        void backup(xnuggft);
                    } else {
                        updateNuggs(x.data?.nuggs.map((y) => y.id.toNuggId()) ?? [], amt + 100);
                    }
                })
                .catch(() => {
                    void backup(xnuggft);
                });
        } else {
            void backup(xnuggft);
        }
    }, [lazy, updateNuggs, len, graphProblem, xnuggft, backup]);

    const debounced = React.useMemo(() => debounce(callback, 300), [callback]);

    return debounced;
};

export const usePollItems = () => {
    const updateItems = useStore((dat) => dat.updateItems);
    const backup = useStore((dat) => dat.backupItems);

    const len = useStore((dat) => dat.nextItemAmount);

    const [lazy] = useGetAllItemsLazyQuery();

    const graphProblem = health.useHealth();

    const provider = web3.hook.usePriorityProvider();

    const xnuggft = useXNuggftV1(provider);

    const callback = React.useCallback(() => {
        const amt = len;

        if (!graphProblem) {
            void lazy({ variables: { skip: amt } })
                .then((x) => {
                    if (x.error) {
                        void backup(xnuggft);
                    } else {
                        updateItems(x.data?.items.map((y) => y.id.toItemId()) ?? [], amt + 100);
                    }
                })
                .catch(() => {
                    void backup(xnuggft);
                });
        } else {
            void backup(xnuggft);
        }
    }, [lazy, updateItems, len, graphProblem, xnuggft, backup]);

    const debounced = React.useMemo(() => debounce(callback, 300), [callback]);

    return debounced;
};

export default {
    useStore,
    usePollNuggs,
    usePollItems,
    useBackupNuggs: () => useStore((dat) => dat.backupNuggs),
    useBackupItems: () => useStore((dat) => dat.backupItems),
    useNuggs: () => useStore((dat) => dat.nuggs),
    useItems: () => useStore((dat) => dat.items),
};
