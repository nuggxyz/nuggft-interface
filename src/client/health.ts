/* eslint-disable no-param-reassign */
import React from 'react';
import create from 'zustand';
import { combine, persist, subscribeWithSelector } from 'zustand/middleware';

export interface Health {
    lastBlockRpc: number;
    lastBlockGraph: number;
}

const useStore = create(
    persist(
        subscribeWithSelector(
            combine({ lastBlockRpc: 0, lastBlockGraph: 0 } as Health, (set) => {
                const updateLastRpcBlock = (blocknum: number) => {
                    set((draft) => {
                        draft.lastBlockRpc = blocknum;
                    });
                };

                const updateLastBlockGraph = (blocknum: number) => {
                    set((draft) => {
                        draft.lastBlockGraph = blocknum;
                    });
                };

                return { updateLastRpcBlock, updateLastBlockGraph };
            }),
        ),
        { name: 'nugg.xyz-health' },
    ),
);

const useHealth = () => {
    const lastBlockRpc = useStore((state) => state.lastBlockRpc);
    const lastBlockGraph = useStore((state) => state.lastBlockGraph);

    const blockdiff = React.useMemo(() => {
        return Math.abs(lastBlockGraph - lastBlockRpc) || Number(0);
    }, [lastBlockGraph, lastBlockRpc]);

    const graphProblem = React.useMemo(() => {
        return blockdiff > 5 && lastBlockGraph < lastBlockRpc;
    }, [lastBlockGraph, lastBlockRpc, blockdiff]);

    return { blockdiff, graphProblem };
};

// eslint-disable-next-line react-hooks/rules-of-hooks

const useCallbackOnGraphBlockChange = (callback: (() => Promise<unknown>) | (() => unknown)) => {
    const kill = useStore((data) => data.lastBlockGraph);

    React.useEffect(() => {
        console.log('YOLLLOOOOOOOOOOOOOOO');
        void callback();
    }, [kill]);
};

export default {
    useHealth,
    useCallbackOnGraphBlockChange,
    useUpdateLastBlockRpc: () => useStore((draft) => draft.updateLastRpcBlock),
    useUpdateLastBlockGraph: () => useStore((draft) => draft.updateLastBlockGraph),
    useStore,
};