/* eslint-disable import/no-cycle */
import { useCallback } from 'react';

// eslint-disable-next-line import/no-named-as-default
import shallow from 'zustand/shallow';

import web3 from '@src/web3';

import core from './core';
import { useDotnugg, useDotnuggCacheOnly, useDotnuggSubscription } from './hooks/useDotnugg';
import { TokenId } from './router';
import { ListData, SearchView } from './interfaces';
import { useDarkMode } from './hooks/useDarkMode';

export default {
    ...core,

    live: {
        /// ///// simple ////////
        graph: () => web3.config.apolloClient,

        epoch: {
            default: () => core((state) => state.epoch),
            id: () => core((state) => state.epoch?.id),
            startblock: () => core((state) => state.epoch?.startblock),
            endblock: () => core((state) => state.epoch?.endblock),
            status: () => core((state) => state.epoch?.status),
        },

        lastSwap: {
            tokenId: () => core((state) => state.lastSwap?.tokenId),
            type: () => core((state) => state.lastSwap?.type),
            tokenIdWithOptionalOverride: (tokenId?: TokenId) =>
                // eslint-disable-next-line react-hooks/rules-of-hooks
                core(useCallback((state) => tokenId || state.lastSwap?.tokenId, [tokenId])),
        },

        // lastView: {
        //     tokenId: () => core((state) => state.lastView?.tokenId),
        //     type: () => core((state) => state.lastView?.type),
        // },
        stake: {
            eps: () => core((state) => state.stake?.eps),
            shares: () => core((state) => state.stake?.shares),
            staked: () => core((state) => state.stake?.staked),
        },
        locale: () => core((state) => state.locale),
        route: () => core((state) => state.route),
        // isViewOpen: () => core((state) => state.isViewOpen),
        // isMobileViewOpen: () => core((state) => state.isMobileViewOpen),
        // isMobileWalletOpen: () => core((state) => state.isMobileWalletOpen),

        editingNugg: () => core((state) => state.editingNugg),

        blocknum: () => core((state) => state.blocknum),
        manualPriority: () => core((state) => state.manualPriority),
        searchFilter: {
            viewing: () => core((state) => state.searchFilter?.viewing ?? SearchView.Home),
            target: () => core((state) => state.searchFilter?.target),
            sort: () => core((state) => state.searchFilter?.sort),
            searchValue: () => core((state) => state.searchFilter?.searchValue),
        },
        darkmode: () => core((state) => state.darkmode, shallow),
        recentSwaps: () => core((state) => state.recentSwaps),
        recentItems: () => core((state) => state.recentItems),
        potentialSwaps: () => core((state) => state.potentialSwaps),
        potentialItems: () => core((state) => state.potentialItems),
        /// ///// complex ////////
        offers: (tokenId: TokenId | undefined) =>
            core(
                // eslint-disable-next-line react-hooks/rules-of-hooks
                useCallback(
                    (state) =>
                        [...(tokenId ? state.liveOffers[tokenId] ?? [] : [])].sort((a, b) =>
                            a.eth.gt(b.eth) ? -1 : 1,
                        ),
                    [tokenId],
                ),
            ),
        token: (tokenId: TokenId | undefined) =>
            core(
                // eslint-disable-next-line react-hooks/rules-of-hooks
                useCallback(
                    (state) => (tokenId ? state.liveTokens[tokenId] : undefined),
                    [tokenId],
                ),
            ),
        health: () => core((state) => state.health),
        // lastGraphRefresh: () => coreNonImmer((state) => state.lastRefresh),

        activeSwaps: () =>
            core((state) =>
                state.activeSwaps.filter(
                    (x) => x.endingEpoch && x.endingEpoch >= (state.epoch?.id || 0),
                ),
            ),
        activeItems: () =>
            core((state) =>
                state.activeItems.filter(
                    (x) => x.endingEpoch && x.endingEpoch >= (state.epoch?.id || 0),
                ),
            ),
        activeNuggItem: (id: string | undefined) =>
            core(
                // eslint-disable-next-line react-hooks/rules-of-hooks
                useCallback(
                    (state) => id && state.activeItems.find((item) => item.id.includes(id)),
                    [id],
                ),
            ),
        potentialNuggItem: (id: string | undefined) =>
            core(
                // eslint-disable-next-line react-hooks/rules-of-hooks
                useCallback(
                    (state) => id && state.potentialItems.find((item) => item.id.includes(id)),
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

        feedMessages: () => core((state) => state.feedMessages),

        myUnclaimedNuggOffers: () => core((state) => state.myUnclaimedNuggOffers),
        myUnclaimedItemOffers: () => core((state) => state.myUnclaimedItemOffers),
        pageIsLoaded: () => core((state) => state.pageIsLoaded),
        myUnclaimedOffers: () =>
            core(
                (state) =>
                    [state.myUnclaimedItemOffers, state.myUnclaimedNuggOffers]
                        .flat()
                        .filter(
                            (x) =>
                                x.endingEpoch !== null &&
                                state.epoch?.id &&
                                x.endingEpoch < state.epoch?.id,
                        )
                        .sort((a, b) => ((a.endingEpoch ?? 0) > (b.endingEpoch ?? 0) ? -1 : 1)),
                shallow,
            ),
    },
    mutate: {
        updateBlocknum: () => core((state) => state.updateBlocknum),
        updateProtocol: () => core((state) => state.updateProtocol),
        // routeTo: () => core((state) => state.routeTo),
        // toggleView: () => core((state) => state.toggleView),
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
        // toggleEditingNugg: () => core((state) => state.toggleEditingNugg),
        // hideMobileViewingNugg: () => core((state) => state.hideMobileViewingNugg),
        // toggleMobileWallet: () => core((state) => state.toggleMobileWallet),
        setLastSwap: () => core((state) => state.setLastSwap),
        setPageIsLoaded: () => core((state) => state.setPageIsLoaded),
        // updateClients: () => coreNonImmer((state) => state.updateClients),
        updateToken: () => core((state) => state.updateToken),
        updateLocale: () => core((state) => state.updateLocale),
        updateSearchFilterTarget: () => core((state) => state.updateSearchFilterTarget),
        updateSearchFilterViewing: () => core((state) => state.updateSearchFilterViewing),
        updateSearchFilterSort: () => core((state) => state.updateSearchFilterSort),
        updateSearchFilterSearchValue: () => core((state) => state.updateSearchFilterSearchValue),
        updateUserDarkMode: () => core((state) => state.updateUserDarkMode),
        updateMediaDarkMode: () => core((state) => state.updateMediaDarkMode),
        addFeedMessage: () => core((state) => state.addFeedMessage),
    },
    hook: {
        useDotnugg,
        useDotnuggCacheOnly,
        useDotnuggSubscription,
        useDarkMode,
    },
    static: {
        graph: () => web3.config.apolloClient,
        activeSwaps: () => core.getState().activeSwaps,
        activeItems: () => core.getState().activeItems,
        myNuggs: () => core.getState().myNuggs,
        myLoans: () => core.getState().myLoans,
        epoch: () => core.getState().epoch,
        stake: () => core.getState().stake,
        route: () => core.getState().route,
    },
};
