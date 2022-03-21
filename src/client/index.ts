/* eslint-disable import/no-cycle */
import { useCallback } from 'react';

// eslint-disable-next-line import/no-named-as-default
// import shallow from 'zustand/shallow';

import core from './core';
import { useLiveNugg } from './hooks/useLiveNugg';
import updater from './updater';
import { useLiveItem } from './hooks/useLiveItem';
import { useDotnugg, useDotnuggCacheOnly } from './hooks/useDotnugg';
import router, { TokenId } from './router';
import useLiveToken from './hooks/useLiveToken';
import getToken from './getters/getToken';
import getNugg from './getters/getNugg';
import getItem from './getters/getItem';

const eqFunc = (prev: any, state: any) => JSON.stringify(prev) === JSON.stringify(state);

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
            tokenId: () => core.store((state) => state.lastSwap?.tokenId, eqFunc),
            type: () => core.store((state) => state.lastSwap?.type, eqFunc),
        },

        lastView: {
            tokenId: () => core.store((state) => state.lastView?.tokenId, eqFunc),
            type: () => core.store((state) => state.lastView?.type, eqFunc),
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
                eqFunc,
            ),
        activeSwaps: () => core.store((state) => state.activeSwaps),
        activeItems: () => core.store((state) => state.activeItems),
        activeNuggItem: (id: string | undefined) =>
            core.store(
                // eslint-disable-next-line react-hooks/rules-of-hooks
                useCallback(
                    (state) => id && state.activeItems.find((item) => item.id.includes(id)),
                    [id],
                ),
            ),
        activeLifecycle: () => core.store((state) => state.activeLifecycle),
        activeToken: () => core.store((state) => state.activeToken),
        myNuggs: () => core.store((state) => state.myNuggs),
        myLoans: () =>
            core.store((state) =>
                state.myLoans.sort((a, b) => (a.endingEpoch < b.endingEpoch ? -1 : 1)),
            ),

        myUnclaimedNuggOffers: () => core.store((state) => state.myUnclaimedNuggOffers),
        myUnclaimedItemOffers: () => core.store((state) => state.myUnclaimedItemOffers),
        myUnclaimedOffers: () =>
            core.store((state) =>
                [...state.myUnclaimedItemOffers, ...state.myUnclaimedNuggOffers]
                    .filter(
                        (x) =>
                            x.endingEpoch !== null &&
                            state.epoch?.id &&
                            x.endingEpoch < state.epoch?.id,
                    )
                    .sort((a, b) => ((a.endingEpoch ?? 0) > (b.endingEpoch ?? 0) ? -1 : 1)),
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
        activeToken: () => core.store.getState().activeToken,
        activeLifecycle: () => core.store.getState().activeLifecycle,
        token: (tokenId: string) => getToken(tokenId),
        nugg: (tokenId: string) => getNugg(tokenId),
        item: (tokenId: string) => getItem(tokenId),
    },
    router,
    updater,
};
