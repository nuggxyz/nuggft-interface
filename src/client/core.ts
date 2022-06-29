/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine } from 'zustand/middleware';

import { SupportedLocale } from '@src/lib/i18n/locales';
import { parseItmeIdToNum } from '@src/lib/index';

import {
	ClientState,
	Dimensions,
	SearchResults,
	LiveToken,
	OfferData,
	SearchFilter,
	Theme,
} from './interfaces';

const core = create(
	combine(
		{
			featureTotals: [0, 0, 0, 0, 0, 0, 0, 0],
			stake: undefined,
			myUnclaimedOffers: [],
			nuggft: undefined,
			epoch: undefined,
			nextEpoch: undefined,
			isMobileViewOpen: false,
			isMobileWalletOpen: false,
			route: undefined,
			lastSwap: undefined,
			isViewOpen: false,
			editingNugg: undefined,
			liveOffers: {},
			myNuggs: [],
			myUnclaimedNuggOffers: [],
			myUnclaimedItemOffers: [],
			myRecents: new Set(),
			subscriptionQueue: [],
			myLoans: [],
			activating: false,
			error: undefined,
			manualPriority: undefined,
			liveTokens: {},
			darkmode: {
				user: Theme.LIGHT,
				media: undefined,
			},
			locale: undefined,
			searchFilter: {
				target: undefined,
				viewing: undefined,
				sort: undefined,
				searchValue: undefined,
			},

			dimentions: { width: window.innerWidth, height: window.innerHeight },
			totalNuggs: 0,
			activeSearch: [],
			pageIsLoaded: false,
			started: false,
		} as ClientState,

		(set, get) => {
			function setLastSwap(tokenId: TokenId | undefined): void {
				// @ts-ignore

				set((draft) => {
					draft.lastSwap = tokenId
						? tokenId.isItemId()
							? {
									...parseItmeIdToNum(tokenId),
									tokenId: tokenId as ItemId,
									type: 'item' as const,
							  }
							: {
									tokenId,
									type: 'nugg' as const,
									idnum: Number(tokenId),
							  }
						: undefined;
				});
			}

			function setPageIsLoaded(): void {
				if (!get().pageIsLoaded) {
					// @ts-ignore

					set((draft) => {
						draft.pageIsLoaded = true;
					});
				}
			}

			function updateOffers(tokenId: TokenId, offer: OfferData): void {
				const isNugg = tokenId.isNuggId();

				if (isNugg) {
					const activeSwap = get().liveTokens[tokenId]?.activeSwap;

					if (!activeSwap) {
						return;
					}

					const currentOffers = activeSwap.offers;

					// @ts-ignore
					set((draft) => {
						draft.liveTokens[tokenId].activeSwap!.offers = [
							offer,
							...currentOffers.filter((o) => o.account !== offer.account),
						];
						draft.liveTokens[tokenId].activeSwap!.endingEpoch = offer.agencyEpoch;
						draft.liveTokens[tokenId].activeSwap!.eth = offer.eth;
						draft.liveTokens[tokenId].activeSwap!.leader =
							offer.account as AddressString;
					});

					return;
				}

				const activeSwap = get().liveTokens[tokenId]?.activeSwap;

				if (!activeSwap) {
					const theswap = get().liveTokens[tokenId]?.swaps.find(
						(x) => x.owner === offer.sellingTokenId,
					);
					if (theswap) {
						const filteredSwaps = get().liveTokens[tokenId].swaps.filter(
							(x) => x.owner !== offer.sellingTokenId,
						);

						// @ts-ignore
						set((draft) => {
							draft.liveTokens[tokenId].activeSwap = theswap;
							draft.liveTokens[tokenId].activeSwap!.offers = [
								offer,
								...theswap.offers,
							];
							draft.liveTokens[tokenId].activeSwap!.endingEpoch = offer.agencyEpoch;
							draft.liveTokens[tokenId].activeSwap!.eth = offer.eth;
							draft.liveTokens[tokenId].activeSwap!.leader = offer.account as NuggId;
							draft.liveTokens[tokenId].swaps = filteredSwaps;
						});

						return;
					}
				}

				if (activeSwap && activeSwap.endingEpoch === offer.agencyEpoch) {
					const currentOffers = activeSwap.offers;

					// const currentUserOffer = currentOffers.find((o) => o.account === offer.account);

					// @ts-ignore
					set((draft) => {
						draft.liveTokens[tokenId].activeSwap!.offers = [
							offer,
							...currentOffers.filter((o) => o.account !== offer.account),
						];
						draft.liveTokens[tokenId].activeSwap!.endingEpoch = offer.agencyEpoch;
						draft.liveTokens[tokenId].activeSwap!.eth = offer.eth;
						draft.liveTokens[tokenId].activeSwap!.leader = offer.account as NuggId;
					});
				}
			}

			function updateToken(tokenId: TokenId, data: LiveToken): void {
				const curr = get().liveTokens[tokenId];

				if (!curr) {
					// @ts-ignore
					set((draft) => {
						// @ts-ignore
						draft.liveTokens[tokenId] = data;
					});
					return;
				}

				if (JSON.stringify(data) !== JSON.stringify(curr)) {
					const newOffers = data.activeSwap?.offers;

					const curroffers = curr.activeSwap?.offers;

					if (newOffers && curroffers) {
						if (newOffers.length < curroffers.length) {
							data.activeSwap!.offers = curroffers;
						}
					}

					// @ts-ignore
					set((draft) => {
						// @ts-ignore
						draft.liveTokens[tokenId] = data;
					});
				}
			}

			function updateDimensions(dim: Dimensions): void {
				// @ts-ignore

				set((draft) => {
					draft.dimentions = dim;
				});
			}

			const updateLocale = (locale: SupportedLocale | undefined) => {
				// @ts-ignore

				set((draft) => {
					draft.locale = locale ?? undefined;
				});
			};

			const updateSearchFilterTarget = (value: SearchFilter['target']) => {
				// @ts-ignore

				set((draft) => {
					draft.searchFilter.target = value;
				});
			};

			const updateSearchFilterViewing = (value: SearchFilter['viewing']) => {
				// @ts-ignore

				set((draft) => {
					draft.searchFilter.viewing = value;
				});
			};

			const updateSearchFilterSort = (value: SearchFilter['sort']) => {
				// @ts-ignore

				set((draft) => {
					draft.searchFilter.sort = value;
				});
			};

			const updateSearchFilterSearchValue = (value: SearchFilter['searchValue']) => {
				// @ts-ignore

				set((draft) => {
					draft.searchFilter.searchValue = value;
				});
			};

			const updateUserDarkMode = (value: Theme | undefined) => {
				// @ts-ignore

				set((draft) => {
					draft.darkmode.user = value;
				});
			};
			const updateMediaDarkMode = (value: Theme | undefined) => {
				// @ts-ignore

				set((draft) => {
					draft.darkmode.media = value;
				});
			};

			const setActiveSearch = (value: SearchResults | undefined) => {
				if (value)
					// @ts-ignore

					set(() => ({
						activeSearch: value,
					}));
			};

			return {
				updateOffers,
				setPageIsLoaded,
				updateToken,
				updateLocale,
				updateSearchFilterTarget,
				updateSearchFilterViewing,
				updateSearchFilterSort,
				updateSearchFilterSearchValue,
				updateUserDarkMode,
				updateMediaDarkMode,
				setLastSwap,
				setActiveSearch,
				updateDimensions,
			};
		},
		// ),
	),
);

// core.subscribe((state) => state.blocknum, console.log);

// export const coreNonImmer = createClientStoreAndActions3();

export default core;
