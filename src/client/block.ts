/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine, persist } from 'zustand/middleware';

import useDebounce from '@src/hooks/useDebounce';
import emitter from '@src/emitter';

const store = create(
    persist(
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

                return { update };
            },
        ),
        { name: 'nugg.xyz-ens' },
    ),
);

export const useBlockUpdater = () => {
    const update = store((state) => state.update);

    emitter.hook.useOn({
        type: emitter.events.IncomingRpcBlock,
        callback: (data) => {
            update(data.data);
        },
    });
};

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
