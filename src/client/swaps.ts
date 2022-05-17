/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine } from 'zustand/middleware';
import { useCallback } from 'react';
import shallow from 'zustand/shallow';

import { timer } from '@src/classes/Timer';

import { EpochData } from './interfaces';

interface Offer<T> {
    account: T;
    eth: BigNumber;
    txhash: string;
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
    combine({ data: {} as TokenIdDictionary<SwapData> }, (set, get) => {
        function updateSingle(data: SwapData): void {
            if (JSON.stringify(data) !== JSON.stringify(get().data[data.tokenId])) {
                // @ts-ignore
                set((draft) => {
                    if (data.isItem()) {
                        draft.data[data.tokenId] = Object.freeze(data);
                    } else {
                        draft.data[data.tokenId] = Object.freeze(data);
                    }
                });
            }
        }

        function updateBatch(data: SwapData[]): void {
            timer.start('a');
            data.forEach((x) => updateSingle(x));
            timer.stop('a');
        }

        function update(data: SwapData | SwapData[]): void {
            if (Array.isArray(data)) updateBatch(data);
            else updateSingle(data);
        }

        return { update };
    }),
);

export default {
    useUpdateSwaps: () => useStore((x) => x.update),
    useSwapList: () => useStore((x) => Object.values(x.data), shallow),
    useSwap: <A extends TokenId>(tokenId: A | undefined) => {
        return useStore(
            useCallback(
                (state) => (tokenId !== undefined ? state.data[tokenId] : undefined),
                [tokenId],
            ),
            shallow,
        );
    },
    useStore,
};
