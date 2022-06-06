/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine } from 'zustand/middleware';
import { useCallback } from 'react';
import shallow from 'zustand/shallow';

import { EpochData } from './interfaces';

interface Offer<T> {
    account: T;
    eth: BigNumber;
    txhash: string;
    incrementX64?: BigNumber;
}

interface SwapDataBase extends TokenIdFactoryBase {
    listDataType: 'swap';
    eth: BigNumber;
    epoch: EpochData | null;
    endingEpoch: number | null;
    canceledEpoch: number | null;
    leader?: unknown;
    owner: unknown;
    num: number | null;
    bottom: BigNumber;
    isBackup: boolean;
    count?: unknown;
    isTryout?: unknown;
    startUnix?: number;
    readonly offers: unknown;
}

interface SwapDataBase__Nugg {
    leader?: AddressString;
    owner: AddressString;
    readonly offers: Offer<AddressString>[];
}

interface SwapDataBase__Item {
    leader?: NuggId;
    owner: NuggId;
    count: number;
    isTryout: boolean;
    readonly offers: Offer<NuggId>[];
}

export type SwapData = TokenIdFactoryCreator<SwapDataBase, SwapDataBase__Nugg, SwapDataBase__Item>;

const useStore = create(
    combine(
        {
            data: new Map<TokenId, SwapData>(),
            prev: {
                current: [] as TokenId[],
                next: [] as TokenId[],
                recent: [] as TokenId[],
                potential: [] as TokenId[],
            },
        },
        (set, get) => {
            function updateSingle(data: SwapData): void {
                const prev = get().data.get(data.tokenId);
                let ok = true;
                if (
                    prev?.num !== null &&
                    prev?.num !== undefined &&
                    data?.num !== null &&
                    data?.num !== undefined
                )
                    ok = data.num >= prev.num;
                if (JSON.stringify(data) !== JSON.stringify(prev) && ok) {
                    // @ts-ignore
                    set((draft) => {
                        if (data.isItem()) {
                            draft.data.set(data.tokenId, Object.freeze(data));
                        } else {
                            draft.data.set(data.tokenId, Object.freeze(data));
                        }
                    });
                }
            }

            function updateBatch(data: SwapData[], epoch: number): void {
                data.forEach((x) => updateSingle(x));
                sort(epoch);
            }

            function update(data: SwapData | SwapData[], epoch: number): void {
                if (Array.isArray(data)) updateBatch(data, epoch);
                else updateSingle(data);
            }

            function sort(epoch: number) {
                const prev = {
                    current: [] as TokenId[],
                    next: [] as TokenId[],
                    recent: [] as TokenId[],
                    potential: [] as TokenId[],
                };

                get().data.forEach((curr) => {
                    if (curr.endingEpoch === epoch) {
                        prev.current.push(curr.tokenId);
                    } else if (curr.endingEpoch === epoch + 1) {
                        prev.next.push(curr.tokenId);
                    } else if (!curr.endingEpoch) {
                        prev.potential.push(curr.tokenId);
                    } else if (curr.endingEpoch && curr.endingEpoch < epoch) {
                        prev.recent.push(curr.tokenId);
                    }
                });

                prev.potential
                    .sort((a, b) => (a > b ? 1 : -1))
                    .sort((a) => (a.startsWith('nugg') ? -1 : 1));

                set(() => ({
                    prev,
                }));
            }

            return { update, sort };
        },
    ),
);

export default {
    useUpdateSwaps: () => useStore((x) => x.update),
    useSortedSwapList: () =>
        useStore((s) => {
            return s.prev;
        }),
    useSwapList: () =>
        useStore((s) => {
            // if (a++ % 10 === 0) console.log(a);
            return s.data.values();
        }, shallow),
    useSwap: <A extends TokenId>(tokenId: A | undefined) => {
        return useStore(
            useCallback(
                (state) => (tokenId !== undefined ? state.data.get(tokenId) : undefined),
                [tokenId],
            ),
            shallow,
        );
    },
    useStore,
};
