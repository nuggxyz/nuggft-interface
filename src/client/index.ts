/* eslint-disable import/no-cycle */
import { useCallback } from 'react';

// eslint-disable-next-line import/no-named-as-default
// import shallow from 'zustand/shallow';

import core from './core';
import { useLiveNugg } from './hooks/useLiveNugg';
import updater from './updater';
import { useLiveItem } from './hooks/useLiveItem';
import { useDotnugg, useDotnuggCacheOnly, useDotnuggSubscription } from './hooks/useDotnugg';
import router, { TokenId } from './router';
import useLiveToken from './hooks/useLiveToken';
import { ListData } from './interfaces';

export default {
    ...core,

    // exists: {
    //     lastSwap: () => core.subscribe((state) => state.lastView?.tokenId !== undefined),
    //     lastView: () => core((state) => state.lastView?.tokenId !== undefined),
    // },

    live: {
        /// ///// simple ////////
        graph: () => core((state) => state.graph),
        rpc: () => core((state) => state.rpc),

        epoch: {
            id: () => core((state) => state.epoch?.id),
            startblock: () => core((state) => state.epoch?.startblock),
            endblock: () => core((state) => state.epoch?.endblock),
            status: () => core((state) => state.epoch?.status),
        },

        lastSwap: {
            tokenId: () => core((state) => state.lastSwap?.tokenId),
            type: () => core((state) => state.lastSwap?.type),
        },

        lastView: {
            tokenId: () => core((state) => state.lastView?.tokenId),
            type: () => core((state) => state.lastView?.type),
        },
        stake: {
            eps: () => core((state) => state.stake?.eps),
            shares: () => core((state) => state.stake?.shares),
            staked: () => core((state) => state.stake?.staked),
        },

        route: () => core((state) => state.route),
        isViewOpen: () => core((state) => state.isViewOpen),
        editingNugg: () => core((state) => state.editingNugg),

        blocknum: () => core((state) => state.blocknum),
        manualPriority: () => core((state) => state.manualPriority),

        /// ///// complex ////////
        offers: (tokenId: TokenId | undefined) =>
            core(
                // eslint-disable-next-line react-hooks/rules-of-hooks
                useCallback(
                    (state) => (tokenId ? state.activeOffers[tokenId] ?? [] : []),
                    [tokenId],
                ),
            ),
        activeSwaps: () => core((state) => state.activeSwaps),
        activeItems: () => core((state) => state.activeItems),
        activeNuggItem: (id: string | undefined) =>
            core(
                // eslint-disable-next-line react-hooks/rules-of-hooks
                useCallback(
                    (state) => id && state.activeItems.find((item) => item.id.includes(id)),
                    [id],
                ),
            ),
        myRecents: () =>
            core((state) =>
                Array.from(state.myRecents)
                    .map((x) => JSON.parse(x) as ListData)
                    .reverse(),
            ),

        myNuggs: () =>
            core((state) => {
                return [...state.myNuggs].sort((a, b) =>
                    Number(a.tokenId) > Number(b.tokenId) ? 1 : -1,
                );
            }),
        myLoans: () =>
            core((state) =>
                [...state.myLoans].sort((a, b) => (a.endingEpoch < b.endingEpoch ? -1 : 1)),
            ),

        myUnclaimedNuggOffers: () => core((state) => state.myUnclaimedNuggOffers),
        myUnclaimedItemOffers: () => core((state) => state.myUnclaimedItemOffers),
        myUnclaimedOffers: () =>
            core((state) =>
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
    mutate: {
        updateBlocknum: () => core((state) => state.updateBlocknum),
        updateProtocol: () => core((state) => state.updateProtocol),
        routeTo: () => core((state) => state.routeTo),
        toggleView: () => core((state) => state.toggleView),
        updateClients: () => core((state) => state.updateClients),
        updateOffers: () => core((state) => state.updateOffers),
        removeLoan: () => core((state) => state.removeLoan),
        removeNuggClaim: () => core((state) => state.removeNuggClaim),
        removeItemClaimIfMine: () => core((state) => state.removeItemClaimIfMine),
        addNuggClaim: () => core((state) => state.addNuggClaim),
        addItemClaim: () => core((state) => state.addItemClaim),
        addLoan: () => core((state) => state.addLoan),
        updateLoan: () => core((state) => state.updateLoan),
        addNugg: () => core((state) => state.addNugg),
        removeNugg: () => core((state) => state.removeNugg),
        toggleEditingNugg: () => core((state) => state.toggleEditingNugg),
    },
    hook: {
        useLiveNugg,
        useLiveItem,
        useLiveToken,
        useDotnugg,
        useDotnuggCacheOnly,
        useDotnuggSubscription,
    },
    static: {
        graph: () => core.getState().graph,
        rpc: () => core.getState().rpc,
        activeSwaps: () => core.getState().activeSwaps,
        activeItems: () => core.getState().activeItems,
        myNuggs: () => core.getState().myNuggs,
        myLoans: () => core.getState().myLoans,
        epoch: () => core.getState().epoch,
        stake: () => core.getState().stake,
        route: () => core.getState().route,
    },
    router,
    updater,
};
