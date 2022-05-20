/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine } from 'zustand/middleware';

import useDebounce from '@src/hooks/useDebounce';
import emitter from '@src/emitter';

const store = create(
    combine(
        {
            block: 0 as number,
        },
        (set) => {
            const update = (block: number) => {
                set(() => ({
                    block,
                }));
            };

            const emit = emitter.on.bind(undefined, {
                type: emitter.events.IncomingRpcBlock,
                callback: (data) => {
                    update(data.data);
                },
            });

            return { update, emit };
        },
    ),
);

store.getState().emit();

export default {
    useBlock: () => store((state) => state.block),
    useBlockWithDebounce: (delay: number) => {
        const block = store((state) => state.block);
        return useDebounce(block, delay);
    },

    useUpdateBlock: () => store((state) => state.update),
    ...store,
};
