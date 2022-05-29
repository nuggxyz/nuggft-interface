/* eslint-disable no-param-reassign */

import create from 'zustand';
import { combine } from 'zustand/middleware';
import React from 'react';

import web3 from '@src/web3';

import block from './block';

type Epoch = {
    startblock: number | null;
    endblock: number | null;
    epoch: number | null;
    status: 'OVER' | 'ACTIVE' | 'PENDING' | null;
    seconds: number | null;
    minutes: number | null;
    blocksRemaining: number | null;
    warning: boolean;
    // countdownMinutes: number;
    // countdownSeconds: number;
};

const calculateStaticData = (epoch: number, liveBlocknum: number): Epoch => {
    const startblock = web3.config.calculateStartBlock(epoch);
    const endblock = web3.config.calculateStartBlock(epoch + 1) - 1;

    let blocksRemaining = 0;
    let status = 'ACTIVE' as Epoch['status'];

    blocksRemaining = endblock - liveBlocknum;

    /// //////////////////////////////
    // @danny7even is this okay to add?
    //     the ring was starting to overshoot at the end of an epoch after I updated the token
    if (blocksRemaining <= 0) {
        blocksRemaining = 0;
        status = 'OVER';
    }
    /// //////////////////////////////

    const seconds = blocksRemaining * 12;
    const minutes = Math.floor(seconds / 60);

    if (blocksRemaining >= web3.config.DEFAULT_CONTRACTS.Interval) {
        status = 'PENDING';
    }

    const warning =
        status === 'ACTIVE' && (+startblock + 255 - liveBlocknum < 16 || +endblock < liveBlocknum);

    return {
        epoch,
        startblock,
        endblock,
        blocksRemaining,
        seconds,
        minutes,
        status,
        warning,
    };
};

const EMPTY = {
    epoch: null,
    startblock: null,
    endblock: null,
    blocksRemaining: null,
    seconds: null,
    minutes: null,
    status: null,
    warning: false,
};

const store = create(
    combine({} as Record<number, Epoch> & Record<'active', number>, (set) => {
        const update = (blocknum: number) => {
            const epoch = web3.config.calculateEpochId(blocknum);
            const active = calculateStaticData(epoch, blocknum);

            // @ts-ignore
            set((draft) => {
                draft.active = epoch;
                draft[epoch] = active;
                draft[epoch + 1] = calculateStaticData(epoch + 1, blocknum);
                draft[epoch - 1] = calculateStaticData(epoch - 1, blocknum);
            });
        };

        return { update };
    }),
);

const useEpoch = (epochId: number | null | undefined, blocknum?: number) => {
    const main = store(
        React.useCallback((state) => (epochId ? state[epochId] : undefined), [epochId]),
    );

    const backup = React.useMemo(() => {
        if (
            main === undefined &&
            epochId !== null &&
            epochId !== undefined &&
            blocknum !== undefined
        ) {
            const calcres = calculateStaticData(epochId, blocknum);
            // console.log({ calcres });
            return calcres;
        }
        return undefined;
    }, [main, epochId, blocknum]);

    const res = main || backup || EMPTY;

    return res;
};

export const useEpochUpdater = () => {
    const blocknum = block.useBlock();

    const update = store((state) => state.update);

    React.useEffect(() => {
        if (blocknum) void update(blocknum);
    }, [blocknum, update]);

    return null;
};

export default {
    useEpoch,
    active: {
        useWarning: () => store((state) => state[state.active]?.warning ?? null),
        useId: () => store((state) => state[state.active]?.epoch ?? null),
        useStartBlock: () => store((state) => state[state.active]?.startblock ?? null),
        useEndBlock: () => store((state) => state[state.active]?.endblock ?? null),
        useMinutes: () => store((state) => state[state.active]?.minutes ?? null),
        useSeconds: () => store((state) => state[state.active]?.seconds ?? null),
    },

    useSeconds: (epochId: number) =>
        store(
            React.useCallback((state) => (epochId ? state[epochId].seconds : undefined), [epochId]),
        ),
    useMinutes: (epochId: number) =>
        store(
            React.useCallback((state) => (epochId ? state[epochId].minutes : undefined), [epochId]),
        ),

    ...store,
};
