/* eslint-disable import/no-cycle */
import { useCallback } from 'react';

// eslint-disable-next-line import/no-named-as-default
import core from './core';
import { useLiveNugg } from './hooks/useLiveNugg';
import updater from './updater';
import { useLiveItem } from './hooks/useLiveItem';
import { useDotnugg, useDotnuggCacheOnly } from './hooks/useDotnugg';
import router, { TokenId } from './router';
import useLiveToken from './hooks/useLiveToken';

export default {
    ...core,

    exists: {
        lastSwap: () => core.store((state) => state.lastView?.tokenId !== undefined),
        lastView: () => core.store((state) => state.lastView?.tokenId !== undefined),
    },

    live: {
        /// ///// simple ////////
        apollo: () => core.store((state) => state.apollo),
        infura: () => core.store((state) => state.infura),

        epoch: {
            id: () => core.store((state) => state.epoch?.id),
            startblock: () => core.store((state) => state.epoch?.startblock),
            endblock: () => core.store((state) => state.epoch?.endblock),
            status: () => core.store((state) => state.epoch?.status),
        },

        lastSwap: {
            tokenId: () => core.store((state) => state.lastSwap?.tokenId),
            type: () => core.store((state) => state.lastSwap?.type),
        },

        lastView: {
            tokenId: () => core.store((state) => state.lastView?.tokenId),
            type: () => core.store((state) => state.lastView?.type),
        },
        stake: {
            eps: () => core.store((state) => state.stake?.eps),
            shares: () => core.store((state) => state.stake?.shares),
            staked: () => core.store((state) => state.stake?.staked),
        },

        route: () => core.store((state) => state.route),
        isViewOpen: () => core.store((state) => state.isViewOpen),
        blocknum: () => core.store((state) => state.blocknum),
        manualPriority: () => core.store((state) => state.manualPriority),

        /// ///// complex ////////
        offers: (tokenId: TokenId | undefined) =>
            core.store(
                // eslint-disable-next-line react-hooks/rules-of-hooks
                useCallback(
                    (state) => (tokenId ? state.activeOffers[tokenId] ?? [] : []),
                    [tokenId],
                ),
            ),
        activeSwaps: () => core.store((state) => state.activeSwaps),
        activeItems: () => core.store((state) => state.activeItems),
        activeNuggItem: (id: string) =>
            core.store(
                // eslint-disable-next-line react-hooks/rules-of-hooks
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
                    a.endingEpoch ?? (b.endingEpoch ?? 0) > 0 ? -1 : 1,
                ),
            ),
    },
    hook: {
        useLiveNugg,
        useLiveItem,
        useLiveToken,
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
        require: {
            apollo: () => {
                return core.store.getState().apollo!;
            },
            infura: () => {
                return core.store.getState().infura!;
            },
        },
    },
    router,
    updater,
};
