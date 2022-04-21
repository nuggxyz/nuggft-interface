/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine } from 'zustand/middleware';
import { useCallback } from 'react';
import shallow from 'zustand/shallow';

import { EthInt } from '@src/classes/Fraction';

export interface SwapDataBase<T extends TokenType> extends TokenIdAsType<T> {
    listDataType: 'swap';
    eth: EthInt;
    endingEpoch: number | null;
    dotnuggRawCache: undefined;
    leader: PickFromTokenType<T, AddressString, NuggId>;
}

export type SwapData = { [S in TokenType]: SwapDataBase<S> }[TokenType];

// const abc: SwapData = {
//     tokenId: `item-333`,
//     listDataType: 'swap',
//     eth: new EthInt(0),
//     endingEpoch: 0,
//     dotnuggRawCache: undefined,
//     leader: '0x444',
// };

const store = create(
    combine(
        {
            data: {} as { [_: TokenId]: SwapData },
        },
        (set, get) => {
            function updateSingle(data: SwapData): void {
                set((draft) => {
                    if (JSON.stringify(data) !== JSON.stringify(get().data[data.tokenId])) {
                        draft.data[data.tokenId] = data;
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
    update: () => store((x) => x.update),
    useSwap: (tokenId: TokenId | undefined) =>
        store(
            useCallback((state) => (tokenId ? state.data[tokenId] : undefined), [tokenId]),
            shallow,
        ),
    ...store,
};
