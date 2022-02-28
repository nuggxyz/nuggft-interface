import core from './core';
import { useSafeLiveOffers, useLiveOffers } from './hooks/useLiveOffers';
import { useLiveProtocol } from './hooks/useLiveProtocol';
import { useSafeLiveStake } from './hooks/useLiveStake';
import { useLiveNugg } from './hooks/useLiveNugg';
import updater from './updater';

export default {
    ...core,
    live: {
        apollo: () => core.store((state) => state.apollo),
        infura: () => core.store((state) => state.infura),
        activeSwaps: () => core.store((state) => state.activeSwaps),
        epoch: () => core.store((state) => state.epoch),
        stake: () => core.store((state) => state.stake),
    },
    hook: {
        useSafeLiveOffers,
        useLiveOffers,
        useSafeLiveStake,
        useLiveNugg,
        useLiveProtocol,
    },
    static: {
        apollo: () => core.store.getState().apollo,
        infura: () => core.store.getState().infura,
        activeSwaps: () => core.store.getState().activeSwaps,
        epoch: () => core.store.getState().epoch,
        stake: () => core.store.getState().stake,
    },

    updater,
};
