/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine } from 'zustand/middleware';
import React from 'react';

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

            return { update };
        },
    ),
);

export const useBlockUpdater = () => {
    const update = store((state) => state.update);
    emitter.hook.useOn({
        type: emitter.events.IncomingRpcBlock,
        callback: React.useCallback(
            (data) => {
                console.log('AYYYYEEEE', data.data);
                update(data.data);
            },
            [update],
        ),
    });
};

export default {
    useBlock: () => store((state) => state.block),
    useBlockWithDebounce: (delay: number) => {
        const block = store((state) => state.block);
        return useDebounce(block, delay);
    },
    useBlockUpdater,
    useUpdateBlock: () => store((state) => state.update),
    ...store,
};
