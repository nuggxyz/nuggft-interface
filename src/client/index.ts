import { useCallback } from 'react';

import core from './core';
import { useLiveOffers } from './hooks/useLiveOffers';
import { useSafeLiveStake } from './hooks/useLiveStake';
import { useLiveNugg } from './hooks/useLiveNugg';
import updater from './updater';
import { useLiveToken } from './hooks/useLiveToken';
import { useLiveItem } from './hooks/useLiveItem';
import { useLiveItemOffers, useSafeLiveItemOffers } from './hooks/useLiveItemOffers';
import { useDotnugg, useDotnuggCacheOnly } from './hooks/useDotnugg';
import router from './router';
import { TokenId } from './router';

export default {
    ...core,
    live: {
        apollo: () => core.store((state) => state.apollo),
        infura: () => core.store((state) => state.infura),
        activeSwaps: () => core.store((state) => state.activeSwaps),
        activeItems: () => core.store((state) => state.activeItems),
        activeNuggItem: (id: string) =>
            core.store(
                useCallback(
                    (state) => state.activeItems.find((item) => item.id.includes(id)),
                    [id],
                ),
            ),
        myNuggs: () => core.store((state) => state.myNuggs),
        myLoans: () =>
            core.store((state) =>
                state.myLoans.sort((a, b) => (a.endingEpoch < b.endingEpoch ? -1 : 1)),
            ),

        myUnclaimedNuggOffers: () => core.store((state) => state.myUnclaimedNuggOffers),
        myUnclaimedItemOffers: () => core.store((state) => state.myUnclaimedItemOffers),
        myUnclaimedOffers: () =>
            core.store((state) =>
                [...state.myUnclaimedItemOffers, ...state.myUnclaimedNuggOffers].sort((a, b) =>
                    a.endingEpoch < b.endingEpoch ? -1 : 1,
                ),
            ),

        epoch: () => core.store((state) => state.epoch),
        epoch__id: () => core.store((state) => state.epoch__id),
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
        offers: (tokenId: TokenId) =>
            core.store(useCallback((state) => state.activeOffers[tokenId], [tokenId])),
    },
    hook: {
        useLiveOffers,
        useSafeLiveStake,
        useLiveNugg,
        useLiveToken,
        useLiveItem,
        useLiveItemOffers,
        useSafeLiveItemOffers,
        useSafeTokenOffers: (tokenId: string) =>
            tokenId?.includes('item-') ? useSafeLiveItemOffers(tokenId) : useLiveOffers(tokenId),
        useDotnugg,
        useDotnuggCacheOnly,
    },
    static: {
        apollo: () => core.store.getState().apollo,
        infura: () => core.store.getState().infura,
        activeSwaps: () => core.store.getState().activeSwaps,
        activeItems: () => core.store.getState().activeItems,
        myNuggs: () => core.store.getState().myNuggs,
        myLoans: () => core.store.getState().myLoans,

        epoch: () => core.store.getState().epoch,
        stake: () => core.store.getState().stake,
        route: () => core.store.getState().route,
    },
    router,
    updater,
};
