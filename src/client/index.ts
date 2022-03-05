import core from './core';
import { useSafeLiveOffers, useLiveOffers } from './hooks/useLiveOffers';
import { useSafeLiveStake } from './hooks/useLiveStake';
import { useLiveNugg } from './hooks/useLiveNugg';
import { useLiveMyNuggs } from './hooks/useLiveMyNuggs';
import updater from './updater';

export default {
    ...core,
    live: {
        apollo: () => core.store((state) => state.apollo),
        infura: () => core.store((state) => state.infura),
        activeSwaps: () => core.store((state) => state.activeSwaps),
        myNuggs: () => core.store((state) => state.myNuggs),
        epoch: () => core.store((state) => state.epoch),
        stake: () => core.store((state) => state.stake),
        manualPriority: () => core.store((state) => state.manualPriority),
    },
    hook: {
        useSafeLiveOffers,
        useLiveOffers,
        useSafeLiveStake,
        useLiveNugg,
        useLiveMyNuggs,
    },
    static: {
        apollo: () => core.store.getState().apollo,
        infura: () => core.store.getState().infura,
        activeSwaps: () => core.store.getState().activeSwaps,
        myNuggs: () => core.store.getState().myNuggs,
        epoch: () => core.store.getState().epoch,
        stake: () => core.store.getState().stake,
    },

    updater,
};
