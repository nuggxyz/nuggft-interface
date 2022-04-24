/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine } from 'zustand/middleware';
import { useCallback } from 'react';
import shallow from 'zustand/shallow';

import { EthInt } from '@src/classes/Fraction';

import { EpochData } from './interfaces';

interface SwapDataBase extends TokenIdFactoryBase {
    listDataType: 'swap';
    eth: EthInt;
    epoch: EpochData | null;
    endingEpoch: number | null;
    leader?: unknown;
    owner: unknown;
    num: number | null;
    bottom: EthInt;
    isBackup: boolean;
    count?: unknown;
    isTryout?: unknown;
}

interface SwapDataBase__Nugg {
    leader?: AddressString;
    owner: AddressString;
}

interface SwapDataBase__Item {
    leader?: NuggId;
    owner: NuggId;
    count: number;
    isTryout: boolean;
}

export type SwapData = TokenIdFactoryCreator<SwapDataBase, SwapDataBase__Nugg, SwapDataBase__Item>;

const store = create(
    combine(
        {
            data: {} as TokenIdDictionary<SwapData>,
        },
        (set, get) => {
            function updateSingle(data: SwapData): void {
                set((draft) => {
                    if (JSON.stringify(data) !== JSON.stringify(get().data[data.tokenId])) {
                        if (data.isItem()) {
                            draft.data[data.tokenId] = data;
                        } else {
                            draft.data[data.tokenId] = data;
                        }
                    }
                });
            }

            function updateBatch(data: SwapData[]): void {
                data.forEach((x) => updateSingle(x));
            }

            function update(data: SwapData | SwapData[]): void {
                if (Array.isArray(data)) updateBatch(data);
                else updateSingle(data);
            }

            return { update };
        },
    ),
);

export default {
    useUpdateSwaps: () => store((x) => x.update),
    useSwapList: () =>
        store((x) =>
            Object.values(x.data).map((y) => ({ tokenId: y.tokenId, endingEpoch: y.endingEpoch })),
        ),
    useSwap: <A extends TokenId>(tokenId: A | undefined) =>
        store(
            useCallback(
                (state) => (tokenId !== undefined ? state.data[tokenId] : undefined),
                [tokenId],
            ),
            shallow,
        ),
    ...store,
};
