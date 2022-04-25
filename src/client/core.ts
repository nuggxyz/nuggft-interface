/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine, subscribeWithSelector } from 'zustand/middleware';

import { Chain } from '@src/web3/core/interfaces';
import web3 from '@src/web3';
import { SupportedLocale } from '@src/lib/i18n/locales';
import { parseItmeIdToNum } from '@src/lib/index';

import {
    ClientState,
    UnclaimedOffer,
    Dimentions,
    SearchResults,
    LiveToken,
    OfferData,
    LoanData,
    MyNuggsData,
    ClientStateUpdate,
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
    subscribeWithSelector(
        combine(
            {
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
                blocknum: undefined,
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
                health: {
                    lastBlockRpc: 0,
                    lastBlockGraph: 0,
                },
                dimentions: { width: window.innerWidth, height: window.innerHeight },
                totalNuggs: 0,
                activeSearch: [],
                pageIsLoaded: false,
                started: false,
            } as ClientState,

            // devtools(
            (set, get) => {
                function updateBlocknum(blocknum: number, chainId: Chain, startup = false) {
                    const epochId = web3.config.calculateEpochId(blocknum, chainId);

                    const hasStarted = startup || get().started;

                    set((draft) => {
                        if (startup) {
                            draft.started = true;
                        }

                        if (hasStarted && !draft.route) {
                            draft.route = window.location.hash;
                        }

                        if (!draft.epoch || epochId !== draft.epoch.id) {
                            draft.epoch = {
                                id: epochId,
                                startblock: web3.config.calculateStartBlock(epochId, chainId),
                                endblock: web3.config.calculateStartBlock(epochId + 1, chainId) - 1,
                                status: 'ACTIVE',
                            };
                            draft.nextEpoch = {
                                id: epochId + 1,
                                startblock: web3.config.calculateStartBlock(epochId + 2, chainId),
                                endblock: web3.config.calculateStartBlock(epochId + 2, chainId) - 1,
                                status: 'PENDING',
                            };
                        }

                        draft.blocknum = blocknum;
                        draft.health.lastBlockRpc = blocknum;
                    });
                }

                function updateProtocolSimple(
                    upd: Pick<ClientStateUpdate, 'epoch' | 'stake' | 'totalNuggs' | 'health'>,
                ): void {
                    set((draft) => {
                        if (upd.epoch) draft.epoch = upd.epoch;
                        if (upd.stake) draft.stake = upd.stake;
                        if (upd.health?.lastBlockGraph)
                            draft.health.lastBlockGraph = upd.health.lastBlockGraph;
                        if (upd.totalNuggs || upd.totalNuggs === 0)
                            draft.totalNuggs = upd.totalNuggs;
                    });
                }

                function updateProtocol(stateUpdate: ClientStateUpdate): void {
                    set((draft) => {
                        if (stateUpdate.health?.lastBlockGraph)
                            draft.health.lastBlockGraph = stateUpdate.health.lastBlockGraph;
                        if (stateUpdate.totalNuggs) draft.totalNuggs = stateUpdate.totalNuggs;
                        if (stateUpdate.stake) draft.stake = stateUpdate.stake;
                        if (stateUpdate.editingNugg) draft.editingNugg = stateUpdate.editingNugg;
                        // if (stateUpdate.notableSwaps) draft.notableSwaps = stateUpdate.notableSwaps;
                        // if (stateUpdate.recentSwaps) draft.recentSwaps = stateUpdate.recentSwaps;
                        // if (stateUpdate.recentItems) draft.recentItems = stateUpdate.recentItems;
                        // if (stateUpdate.activeSwaps) draft.activeSwaps = stateUpdate.activeSwaps;
                        // if (stateUpdate.activeItems) draft.activeItems = stateUpdate.activeItems;
                        // if (stateUpdate.potentialSwaps)
                        //     draft.potentialSwaps = stateUpdate.potentialSwaps;
                        // if (stateUpdate.potentialItems)
                        // draft.potentialItems = stateUpdate.potentialItems;
                        if (stateUpdate.manualPriority)
                            draft.manualPriority = stateUpdate.manualPriority;
                        if (stateUpdate.myNuggs) draft.myNuggs = stateUpdate.myNuggs;
                        if (stateUpdate.myLoans) draft.myLoans = stateUpdate.myLoans;
                        if (stateUpdate.myUnclaimedNuggOffers)
                            draft.myUnclaimedNuggOffers = stateUpdate.myUnclaimedNuggOffers;
                        if (stateUpdate.myUnclaimedItemOffers)
                            draft.myUnclaimedItemOffers = stateUpdate.myUnclaimedItemOffers;

                        if (stateUpdate.myUnclaimedNuggOffers || stateUpdate.myUnclaimedItemOffers)
                            draft.myUnclaimedOffers = [
                                ...stateUpdate.myUnclaimedItemOffers,
                                ...stateUpdate.myUnclaimedNuggOffers,
                            ];
                    });
                }

                function setLastSwap(tokenId: TokenId | undefined): void {
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

                function removeLoan(tokenId: NuggId): void {
                    set((draft) => {
                        draft.myLoans.filterInPlace((x) => x.nugg !== tokenId);
                    });
                }

                function removeNugg(tokenId: NuggId): void {
                    set((draft) => {
                        draft.myNuggs.filterInPlace((x) => x.tokenId !== tokenId);
                    });
                }

                function removeNuggClaim(tokenId: NuggId): void {
                    set((draft) => {
                        draft.myUnclaimedNuggOffers.filterInPlace((x) => x.tokenId !== tokenId);
                    });
                }

                function removeItemClaimIfMine(nuggId: NuggId, itemId: ItemId): void {
                    set((draft) => {
                        draft.myUnclaimedItemOffers.filterInPlace(
                            (x) => x.leader || x.tokenId !== itemId,
                        );
                    });
                }

                function addNuggClaim(update: UnclaimedOffer): void {
                    set((draft) => {
                        if (update.isNugg()) draft.myUnclaimedNuggOffers.unshift(update);
                    });
                }

                function addItemClaim(update: UnclaimedOffer): void {
                    set((draft) => {
                        if (update.isItem()) draft.myUnclaimedItemOffers.unshift(update);
                    });
                }

                function addLoan(update: LoanData): void {
                    set((draft) => {
                        draft.myLoans.unshift(update);
                    });
                }

                function updateLoan(update: LoanData): void {
                    set((draft) => {
                        draft.myLoans = [
                            update,
                            ...draft.myLoans.filter((x) => x.nugg !== update.nugg),
                        ];
                    });
                }

                function setPageIsLoaded(): void {
                    if (!get().pageIsLoaded) {
                        set((draft) => {
                            draft.pageIsLoaded = true;
                        });
                    }
                }

                function addNugg(update: MyNuggsData): void {
                    set((draft) => {
                        draft.myNuggs.unshift(update);
                    });
                }

                function addToSubscritpionQueue(update: TokenId): void {
                    set((draft) => {
                        if (get().subscriptionQueue.indexOf(update) === -1) {
                            draft.subscriptionQueue.push(update);
                        }
                    });
                }

                function updateOffers(tokenId: TokenId, offers: OfferData[]): void {
                    set((draft) => {
                        if (!draft.liveOffers[tokenId]) draft.liveOffers[tokenId] = [];
                        if (!draft.liveOffers[tokenId]) draft.liveOffers[tokenId] = [];

                        draft.liveOffers[tokenId].mergeInPlace(
                            offers,
                            'user',
                            (a, b) => b.eth.gt(a.eth),
                            (a, b) => (a.eth.gt(b.eth) ? 1 : -1),
                        );

                        // this makes sure that token rerenders too when a new offer comes in
                        if (offers.length > 0) {
                            const token = get().liveTokens[tokenId];
                            const tmpOffer = offers[0];

                            if (token && token.type === 'item' && !token.activeSwap) {
                                const preloadedSwap = token.swaps.find(
                                    (x) => x.owner === tmpOffer.sellingTokenId,
                                );

                                const { nextEpoch } = get();

                                if (preloadedSwap && nextEpoch) {
                                    draft.liveTokens[tokenId].activeSwap = {
                                        ...preloadedSwap,
                                        endingEpoch: nextEpoch.id,
                                        epoch: nextEpoch,
                                        count: 1,
                                    };
                                }
                            }
                        }
                    });
                }

                function updateToken(tokenId: TokenId, data: LiveToken): void {
                    set((draft) => {
                        // const lifeData = wrapLifecycle(data);
                        if (JSON.stringify(data) !== JSON.stringify(get().liveTokens[tokenId])) {
                            // @ts-ignore
                            draft.liveTokens[tokenId] = data;
                        }
                    });
                }

                function updateDimentions(dim: Dimentions): void {
                    set((draft) => {
                        draft.dimentions = dim;
                    });
                }

                const updateLocale = (locale: SupportedLocale | undefined) => {
                    set((draft) => {
                        draft.locale = locale ?? undefined;
                    });
                };

                const updateSearchFilterTarget = (value: SearchFilter['target']) => {
                    set((draft) => {
                        draft.searchFilter.target = value;
                    });
                };

                const updateSearchFilterViewing = (value: SearchFilter['viewing']) => {
                    set((draft) => {
                        draft.searchFilter.viewing = value;
                    });
                };

                const updateSearchFilterSort = (value: SearchFilter['sort']) => {
                    set((draft) => {
                        draft.searchFilter.sort = value;
                    });
                };

                const updateSearchFilterSearchValue = (value: SearchFilter['searchValue']) => {
                    set((draft) => {
                        draft.searchFilter.searchValue = value;
                    });
                };

                const updateUserDarkMode = (value: Theme | undefined) => {
                    set((draft) => {
                        draft.darkmode.user = value;
                    });
                };
                const updateMediaDarkMode = (value: Theme | undefined) => {
                    set((draft) => {
                        draft.darkmode.media = value;
                    });
                };

                const setActiveSearch = (value: SearchResults | undefined) => {
                    if (value)
                        set((draft) => {
                            draft.activeSearch = value;
                        });
                };

                return {
                    updateBlocknum,
                    updateProtocol,
                    removeLoan,
                    removeNugg,
                    removeNuggClaim,
                    removeItemClaimIfMine,
                    addNuggClaim,
                    addItemClaim,
                    addLoan,
                    updateLoan,
                    addNugg,
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
                    addToSubscritpionQueue,
                    updateDimentions,
                    updateProtocolSimple,
                };
            },
            // ),
        ),
    ),
);

core.subscribe((state) => state.blocknum, console.log);

// export const coreNonImmer = createClientStoreAndActions3();

export default core;
