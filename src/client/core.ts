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

// enableMapSet();

// const immer__middleware = <T extends State>(
//     fn: StateCreator<T, (partial: ((draft: Draft<T>) => void) | T, replace?: boolean) => void>,
// ): StateCreator<T> =>
//     function immer(set, get, api) {
//         return fn(
//             (partial, replace) => {
//                 const nextState =
//                     typeof partial === 'function'
//                         ? produce(partial as (state: Draft<T>) => T)
//                         : partial;
//                 return set(nextState, replace);
//             },
//             get,
//             api,
//         );
//     };

// const logger__middleware = <T extends State>(fn: StateCreator<T>): StateCreator<T> =>
//     function log(set, get, api) {
//         return fn(
//             (args) => {
//                 set(args);
//                 // console.log('new state', get());
//             },
//             get,
//             api,
//         );
//     };

// function createClientStoreAndActions3() {
//     return create(
//         combine(
//             {
//                 graph: undefined,
//                 lastRefresh: undefined,
//             } as {
//                 graph: ApolloClient<any> | undefined;
//                 lastRefresh: Date | undefined;
//             },

//             (set) => {
//                 return {
//                     updateClients: (graph: ApolloClient<any> | undefined) => {
//                         set(() => {
//                             return { graph, lastRefresh: new Date() };
//                         });
//                     },
//                 };
//             },
//         ),
//     );
// }

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

            function updateOffers(tokenId: TokenId, offers: OfferData[]): void {
                // @ts-ignore

                set((draft) => {
                    if (!draft.liveOffers[tokenId]) draft.liveOffers[tokenId] = [];
                    if (!draft.liveOffers[tokenId]) draft.liveOffers[tokenId] = [];

                    draft.liveOffers[tokenId] = draft.liveOffers[tokenId].merge(
                        offers,
                        'user',
                        (a, b) => b.eth.gt(a.eth),
                        (a, b) => (a.eth.gt(b.eth) ? 1 : -1),
                    );

                    // // this makes sure that token rerenders too when a new offer comes in
                    // if (offers.length > 0) {
                    //     const token = get().liveTokens[tokenId];
                    //     const tmpOffer = offers[0];

                    //     if (token && token.type === 'item' && !token.activeSwap) {
                    //         const preloadedSwap = token.swaps.find(
                    //             (x) => x.owner === tmpOffer.sellingTokenId,
                    //         );

                    //         const { nextEpoch } = get();

                    //         if (preloadedSwap && nextEpoch) {
                    //             draft.liveTokens[tokenId].activeSwap = {
                    //                 ...preloadedSwap,
                    //                 endingEpoch: nextEpoch.id,
                    //                 epoch: nextEpoch,
                    //                 count: 1,
                    //             };
                    //         }
                    //     }
                    // }
                });
            }

            function updateToken(tokenId: TokenId, data: LiveToken): void {
                // @ts-ignore

                if (JSON.stringify(data) !== JSON.stringify(get().liveTokens[tokenId])) {
                    // @ts-ignore

                    set((draft) => {
                        // const lifeData = wrapLifecycle(data);
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
