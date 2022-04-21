/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine } from 'zustand/middleware';
import { useCallback } from 'react';
import shallow from 'zustand/shallow';

import { EthInt } from '@src/classes/Fraction';

interface SwapDataBase extends TokenIdFactory {
    listDataType: 'swap';
    eth: EthInt;
    endingEpoch: number | null;
    dotnuggRawCache: undefined;
    leader: AddressString | NuggId;
}

export type SwapData = TokenIdFactoryCreator<
    SwapDataBase,
    { leader: AddressString },
    { leader: NuggId }
>;

// const abc: SwapData = buildTokenIdFactory({
//     tokenId: `nugg-333`,
//     listDataType: 'swap',
//     eth: new EthInt(0),
//     endingEpoch: 0,
//     dotnuggRawCache: undefined,
//     leader: '0x444',
// });

// if (abc.isItem()) {
//     console.log(abc.le)
// }

// console.log(abc.leader);

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
