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
        activeNuggItem: (id: string) =>
            core.store((state) => state.activeItems.find((item) => item.id.includes(id))),
        myNuggs: () => core.store((state) => state.myNuggs),
        epoch: () => core.store((state) => state.epoch),
        epoch__id: () => core.store((state) => state.epoch__id ?? 0),
        epoch__endblock: () => core.store((state) => state.epoch?.endblock),

        stake: () => core.store((state) => state.stake),
        route: () => core.store((state) => state.route),
        lastSwap: () => core.store((state) => state.lastSwap),
        lastView: () => core.store((state) => state.lastView),
        isViewOpen: () => core.store((state) => state.isViewOpen),
        blocknum: () => core.store((state) => state.blocknum),
        lastSwap__tokenId: () => core.store((state) => state.lastSwap.tokenId),
        lastView__tokenId: () => core.store((state) => state.lastView.tokenId),
        lastSwap__type: () => core.store((state) => state.lastSwap.type),
        lastView__type: () => core.store((state) => state.lastView.type),
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
