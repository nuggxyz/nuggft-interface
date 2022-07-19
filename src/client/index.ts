import { useCallback } from 'react';
import shallow from 'zustand/shallow';

import web3 from '@src/web3';

import core from './core';
import { ListData, SearchView } from './interfaces';
import modal from './modal';
import toast from './toast';
import nuggbook from './nuggbook';
import viewscreen from './viewscreen';
import editscreen from './editscreen';
import viewport from './viewport';
import transactions from './transactions';
import usd from './usd';
import ens from './ens';
import health from './health';
import epoch from './epoch';
import block from './block';
import stake from './stake';
import v2 from './v2';
import v3 from './v3';
import user from './user';
import all from './all';

export default {
	core,

	live: {
		/// ///// simple ////////
		graph: () => web3.config.apolloClient,
		activeSearch: () =>
			core(
				(state) => state.activeSearch, // shallow removed
			),

		lastSwap: {
			tokenId: () => core((state) => state.lastSwap?.tokenId),
			type: () => core((state) => state.lastSwap?.type),
			tokenIdWithOptionalOverride: (tokenId?: TokenId) =>
				// eslint-disable-next-line react-hooks/rules-of-hooks
				core(useCallback((state) => tokenId || state.lastSwap?.tokenId, [tokenId])),
		},

		locale: () => core((state) => state.locale),
		route: () => core((state) => state.route),

		dimensions: () => core((state) => state.dimentions),
		editingNugg: () => core((state) => state.editingNugg),

		searchFilter: {
			viewing: () => core((state) => state.searchFilter?.viewing ?? SearchView.Home),
			target: () => core((state) => state.searchFilter?.target),
			sort: () => core((state) => state.searchFilter?.sort),
			searchValue: () => core((state) => state.searchFilter?.searchValue),
		},
		darkmode: () => core((state) => state.darkmode, shallow),
		/// ///// complex ////////
		offers: <A extends TokenId>(tokenId: A | undefined) =>
			core(
				// eslint-disable-next-line react-hooks/rules-of-hooks
				useCallback(
					(state) => (tokenId ? state.liveTokens[tokenId]?.activeSwap?.offers ?? [] : []),
					[tokenId],
				),
			),
		token: <A extends TokenId>(tokenId: A | undefined) =>
			core(
				// eslint-disable-next-line react-hooks/rules-of-hooks
				useCallback(
					(state) => (tokenId ? state.liveTokens[tokenId] : undefined),
					[tokenId],
				),
			),

		myRecents: () =>
			core((state) =>
				Array.from(state.myRecents)
					.map((x) => JSON.parse(x) as ListData)
					.reverse(),
			),
		pageIsLoaded: () => core((state) => state.pageIsLoaded),
	},
	mutate: {
		setActiveSearch: () => core((state) => state.setActiveSearch),
		updateOffers: () => core((state) => state.updateOffers),
		setLastSwap: () => core((state) => state.setLastSwap),
		setPageIsLoaded: () => core((state) => state.setPageIsLoaded),
		updateToken: () => core((state) => state.updateToken),
		updateLocale: () => core((state) => state.updateLocale),
		updateSearchFilterTarget: () => core((state) => state.updateSearchFilterTarget),
		updateSearchFilterViewing: () => core((state) => state.updateSearchFilterViewing),
		updateSearchFilterSort: () => core((state) => state.updateSearchFilterSort),
		updateSearchFilterSearchValue: () => core((state) => state.updateSearchFilterSearchValue),
		updateUserDarkMode: () => core((state) => state.updateUserDarkMode),
		updateMediaDarkMode: () => core((state) => state.updateMediaDarkMode),
		updateDimensions: () => core((state) => state.updateDimensions),
	},

	modal,
	toast,
	nuggbook,
	viewscreen,
	editscreen,
	viewport,
	transactions,
	usd,
	ens,
	health,
	block,
	epoch,
	stake,
	v2,
	v3,
	user,
	all,
};
