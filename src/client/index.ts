import core from './core';
import { useSafeLiveOffers, useLiveOffers } from './hooks/useLiveOffers';
import { useSafeLiveStake } from './hooks/useLiveStake';
import { useLiveNugg } from './hooks/useLiveNugg';
import { useLiveMyNuggs } from './hooks/useLiveMyNuggs';
import updater from './updater';
import { useLiveToken } from './hooks/useLiveToken';
import { useLiveItem } from './hooks/useLiveItem';
import { useLiveItemOffers, useSafeLiveItemOffers } from './hooks/useLiveItemOffers';
import useDotnugg from './hooks/useDotnugg';
import router from './router';

export default {
    ...core,
    live: {
        apollo: () => core.store((state) => state.apollo),
        infura: () => core.store((state) => state.infura),
        activeSwaps: () => core.store((state) => state.activeSwaps),
        activeItems: () => core.store((state) => state.activeItems),
        myNuggs: () => core.store((state) => state.myNuggs),
        epoch: () => core.store((state) => state.epoch),
        stake: () => core.store((state) => state.stake),
        route: () => core.store((state) => state.route),
        lastSwap: () => core.store((state) => state.lastSwap),
        lastView: () => core.store((state) => state.lastView),
        isViewOpen: () => core.store((state) => state.isViewOpen),
        blocknum: () => core.store((state) => state.blocknum),

        manualPriority: () => core.store((state) => state.manualPriority),
    },
    hook: {
        useSafeLiveOffers,
        useLiveOffers,
        useSafeLiveStake,
        useLiveNugg,
        useLiveToken,
        useLiveItem,
        useLiveMyNuggs,
        useLiveItemOffers,
        useSafeLiveItemOffers,
        useSafeTokenOffers: (tokenId: string) =>
            tokenId?.includes('item-')
                ? useSafeLiveItemOffers(tokenId)
                : useSafeLiveOffers(tokenId),
        useDotnugg,
    },
    static: {
        apollo: () => core.store.getState().apollo,
        infura: () => core.store.getState().infura,
        activeSwaps: () => core.store.getState().activeSwaps,
        activeItems: () => core.store.getState().activeItems,
        myNuggs: () => core.store.getState().myNuggs,
        epoch: () => core.store.getState().epoch,
        stake: () => core.store.getState().stake,
        route: () => core.store.getState().route,
    },
    router,
    updater,
};
