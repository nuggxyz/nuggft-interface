/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine } from 'zustand/middleware';

import useDebounce from '@src/hooks/useDebounce';
import emitter from '@src/emitter';

const store = create(
    combine(
        {
            block: 0 as number,
            lastUpdate: 0 as number,
            lastChange: 0 as number,
        },
        (set, get) => {
            const update = (block: number) => {
                const change = block !== get().block;
                set(() => ({
                    block,
                    lastUpdate: new Date().getTime(),
                    ...(change && { lastChange: new Date().getTime() }),
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
    useLastUpdate: () => store((state) => state.lastUpdate),
    useLastChange: () => store((state) => state.lastChange),

    useBlockWithDebounce: (delay: number) => {
        const block = store((state) => state.block);
        return useDebounce(block, delay);
    },

    useUpdateBlock: () => store((state) => state.update),
    ...store,
};
