/* eslint-disable no-param-reassign */
import { ApolloClient } from '@apollo/client';
import create, { State, StateCreator } from 'zustand';
import { BigNumber, BigNumberish } from 'ethers';
import produce, { Draft, enableMapSet } from 'immer';
import { combine } from 'zustand/middleware';
import { WebSocketProvider, JsonRpcProvider } from '@ethersproject/providers';

import { Chain } from '@src/web3/core/interfaces';
import { extractItemId, parseItmeIdToNum } from '@src/lib';
import web3 from '@src/web3';
import {
    GetLiveItemDocument,
    GetLiveItemQueryResult,
    GetLiveNuggDocument,
    GetLiveNuggQueryResult,
} from '@src/gql/types.generated';
import { executeQuery3b } from '@src/graphql/helpers';
import { Address } from '@src/classes/Address';
import { SupportedLocale } from '@src/lib/i18n/locales';

import { parseRoute, Route, TokenId, ItemId, NuggId } from './router';
import {
    Lifecycle,
    LiveToken,
    LiveTokenWithLifecycle,
    ClientState,
    OfferData,
    UnclaimedNuggOffer,
    UnclaimedItemOffer,
    LoanData,
    MyNuggsData,
    ClientStateUpdate,
    SearchFilter,
    Theme,
} from './interfaces';
import formatLiveNugg from './formatters/formatLiveNugg';

enableMapSet();

const calculateStartBlock = (epoch: BigNumberish, chainId: Chain) => {
    return BigNumber.from(epoch)
        .sub(web3.config.CONTRACTS[chainId].Offset)
        .mul(web3.config.CONTRACTS[chainId].Interval)
        .add(web3.config.CONTRACTS[chainId].Genesis)
        .toNumber();
};

const calculateEpochId = (blocknum: number, chainId: Chain) => {
    return BigNumber.from(blocknum)
        .sub(web3.config.CONTRACTS[chainId].Genesis)
        .div(web3.config.CONTRACTS[chainId].Interval)
        .add(web3.config.CONTRACTS[chainId].Offset)
        .toNumber();
};

const immer__middleware = <T extends State>(
    fn: StateCreator<T, (partial: ((draft: Draft<T>) => void) | T, replace?: boolean) => void>,
): StateCreator<T> =>
    function immer(set, get, api) {
        return fn(
            (partial, replace) => {
                const nextState =
                    typeof partial === 'function'
                        ? produce(partial as (state: Draft<T>) => T)
                        : partial;
                return set(nextState, replace);
            },
            get,
            api,
        );
    };

const logger__middleware = <T extends State>(fn: StateCreator<T>): StateCreator<T> =>
    function log(set, get, api) {
        return fn(
            (args) => {
                set(args);
                // console.log('new state', get());
            },
            get,
            api,
        );
    };

function createClientStoreAndActions3() {
    return create(
        combine(
            {
                rpc: undefined,
                graph: undefined,
            } as {
                rpc: WebSocketProvider | undefined;
                graph: ApolloClient<any> | undefined;
            },

            (set) => {
                return {
                    updateClients: (stateUpdate: { graph: ApolloClient<any> | undefined }) => {
                        set(() => {
                            return stateUpdate;
                        });
                    },
                };
            },
        ),
    );
}

function createClientStoreAndActions2() {
    return create<ClientState>(
        // devtools(
        logger__middleware(
            immer__middleware((set, get) => {
                function updateBlocknum(blocknum: number, chainId: Chain) {
                    const epochId = calculateEpochId(blocknum, chainId);

                    set((draft) => {
                        if (!draft.route) {
                            let parsed = parseRoute(window.location.hash);
                            if (parsed.type === Route.Home) {
                                parsed = {
                                    type: Route.SwapNugg,
                                    tokenId: epochId.toString(),
                                    idnum: epochId,
                                };
                            }

                            if (parsed.type === Route.SwapNugg || parsed.type === Route.SwapItem) {
                                draft.lastSwap = parsed;
                                draft.isViewOpen = false;
                            } else {
                                draft.lastView = parsed;
                                draft.isViewOpen = true;
                            }

                            draft.route = window.location.hash;

                            if (!draft.lastSwap) {
                                draft.lastSwap = {
                                    type: Route.SwapNugg,
                                    tokenId: epochId.toString(),
                                    idnum: epochId,
                                };
                            }
                        }

                        if (!draft.epoch || epochId !== draft.epoch.id) {
                            draft.epoch = {
                                id: epochId,
                                startblock: calculateStartBlock(epochId, chainId),
                                endblock: calculateStartBlock(epochId + 1, chainId) - 1,
                                status: 'ACTIVE',
                            };
                        }

                        draft.blocknum = blocknum;
                    });
                }

                function updateProtocol(stateUpdate: ClientStateUpdate): void {
                    set((draft) => {
                        if (stateUpdate.stake) draft.stake = stateUpdate.stake;
                        if (stateUpdate.editingNugg) draft.editingNugg = stateUpdate.editingNugg;
                        // @ts-ignore
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        if (stateUpdate.graph) draft.graph = stateUpdate.graph;
                        if (stateUpdate.activeSwaps) draft.activeSwaps = stateUpdate.activeSwaps;
                        if (stateUpdate.activeItems) draft.activeItems = stateUpdate.activeItems;
                        if (stateUpdate.manualPriority)
                            draft.manualPriority = stateUpdate.manualPriority;
                        if (stateUpdate.myNuggs) draft.myNuggs = stateUpdate.myNuggs;
                        if (stateUpdate.myLoans) draft.myLoans = stateUpdate.myLoans;
                        if (stateUpdate.myUnclaimedNuggOffers)
                            draft.myUnclaimedNuggOffers = stateUpdate.myUnclaimedNuggOffers;
                        if (stateUpdate.myUnclaimedItemOffers)
                            draft.myUnclaimedItemOffers = stateUpdate.myUnclaimedItemOffers;
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
                            (x) => x.nugg !== nuggId || x.tokenId !== itemId,
                        );
                    });
                }

                function addNuggClaim(update: UnclaimedNuggOffer): void {
                    set((draft) => {
                        draft.myUnclaimedNuggOffers.unshift(update);
                    });
                }

                function addItemClaim(update: UnclaimedItemOffer): void {
                    set((draft) => {
                        draft.myUnclaimedItemOffers.unshift(update);
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

                function addNugg(update: MyNuggsData): void {
                    set((draft) => {
                        draft.myNuggs.unshift(update);
                    });
                }

                function updateOffers(tokenId: TokenId, offers: OfferData[]): void {
                    set((draft) => {
                        if (!get().liveOffers[tokenId]) draft.liveOffers[tokenId] = [];
                        draft.liveOffers[tokenId].mergeInPlace(
                            offers,
                            'user',
                            (a, b) => b.eth.gt(a.eth),
                            (a, b) => (a.eth.gt(b.eth) ? 1 : -1),
                        );
                        const cycle = get().liveTokens[tokenId]?.lifecycle;

                        // this makes sure that token rerenders too when a new offer comes in
                        if (offers.length > 0) {
                            if (cycle === Lifecycle.Bunt)
                                draft.liveTokens[tokenId].lifecycle = Lifecycle.Bat;
                            if (cycle === Lifecycle.Tryout)
                                draft.liveTokens[tokenId].lifecycle = Lifecycle.Deck;
                        }
                    });
                }

                const wrapLifecycle = (token: LiveToken): LiveTokenWithLifecycle => {
                    return Object.assign(token, { lifecycle: getLifecycle(token) });
                };

                const getLifecycle = (token: LiveToken): Lifecycle => {
                    const { epoch } = get();
                    if (token && epoch !== undefined) {
                        if (!token.activeSwap?.id) {
                            if (token.type === 'item' && token.swaps.length > 0)
                                return Lifecycle.Tryout;
                            return Lifecycle.Stands;
                        }

                        if (!token.activeSwap.endingEpoch) return Lifecycle.Bench;
                        if (+token.activeSwap.endingEpoch === epoch.id + 1) {
                            if (token.type === 'nugg' && token.owner === Address.ZERO.hash) {
                                return Lifecycle.Egg;
                            }
                            return Lifecycle.Deck;
                        }
                        if (+token.activeSwap.endingEpoch === epoch.id) {
                            if (token.type === 'nugg' && token.owner === Address.ZERO.hash) {
                                return Lifecycle.Bunt;
                            }
                            return Lifecycle.Bat;
                        }
                        return Lifecycle.Shower;
                    }
                    return Lifecycle.Stands;
                };

                function updateToken(tokenId: TokenId, data: LiveToken): void {
                    set((draft) => {
                        const lifeData = wrapLifecycle(data);
                        if (
                            JSON.stringify(lifeData) !== JSON.stringify(get().liveTokens[tokenId])
                        ) {
                            draft.liveTokens[tokenId] = lifeData;
                        }
                    });
                }

                function routeTo(tokenId: string | `item-${string}`, view: boolean): void {
                    set((draft) => {
                        let route = '#/';

                        const { lastView, lastSwap } = draft;

                        const isItem = tokenId?.includes('item-');

                        if (view) {
                            route += 'view/';
                            draft.isViewOpen = true;
                        } else {
                            draft.isViewOpen = false;
                        }

                        if (isItem) {
                            route += 'item/';
                            const num = parseItmeIdToNum(tokenId as `item-${string}`);
                            route += `${num.feature}/`;
                            route += num.position;
                            if (view) {
                                draft.lastView = {
                                    type: Route.ViewItem,
                                    tokenId: tokenId as `item-${string}`,
                                    ...num,
                                };
                            } else {
                                draft.lastSwap = {
                                    type: Route.SwapItem,
                                    tokenId: tokenId as `item-${string}`,
                                    ...num,
                                };
                            }
                        } else {
                            route += `nugg/${tokenId}`;
                            if (view) {
                                draft.lastView = {
                                    type: Route.ViewNugg,
                                    tokenId,
                                    idnum: +tokenId,
                                };
                            } else {
                                draft.lastSwap = {
                                    type: Route.SwapNugg,
                                    tokenId,
                                    idnum: +tokenId,
                                };
                            }
                        }

                        if (route !== draft.route) {
                            window.location.replace(route);
                        }
                        if (view && lastView) {
                            const save = JSON.stringify({
                                id: lastView.tokenId,
                                type: lastView.type === Route.ViewNugg ? 'nugg' : 'item',
                                dotnuggRawCache: null,
                            });
                            if (draft.myRecents.has(save)) {
                                draft.myRecents.delete(save);
                            }
                            draft.myRecents.add(save);
                        } else if (lastSwap) {
                            const save = JSON.stringify({
                                id: lastSwap.tokenId,
                                type: lastSwap.type === Route.SwapNugg ? 'nugg' : 'item',
                                dotnuggRawCache: null,
                            });
                            if (draft.myRecents.has(save)) {
                                draft.myRecents.delete(save);
                            }
                            draft.myRecents.add(save);
                        }
                    });
                }

                const toggleView = () => {
                    const { isViewOpen, lastSwap } = get();
                    if (lastSwap) routeTo(lastSwap.tokenId, !isViewOpen);
                    else routeTo('', !isViewOpen);
                };

                const toggleEditingNugg = (tokenId: NuggId | undefined) => {
                    set((draft) => {
                        draft.editingNugg = tokenId;
                    });
                };
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

                const start = async (
                    chainId: Chain,
                    rpc: JsonRpcProvider,
                    graph: ApolloClient<any>,
                ): Promise<void> => {
                    const startup = () => {
                        const route = parseRoute(window.location.hash);

                        if (route.type !== Route.Home) {
                            const tokenId = extractItemId(route.tokenId);
                            const isItem = tokenId.startsWith('item-');
                            if (!isItem)
                                void executeQuery3b<GetLiveNuggQueryResult>(
                                    graph,
                                    GetLiveNuggDocument,
                                    { tokenId },
                                ).then((x) => {
                                    if (!x.data?.nugg) window.location.hash = '#/';
                                    else {
                                        const formatted = formatLiveNugg(x.data.nugg);
                                        if (formatted) {
                                            updateToken(tokenId, formatted);
                                        }
                                    }
                                });
                            else
                                void executeQuery3b<GetLiveItemQueryResult>(
                                    graph,
                                    GetLiveItemDocument,
                                    { tokenId },
                                ).then((x) => {
                                    if (!x.data?.item) window.location.hash = '#/';
                                    return x;
                                });
                        }
                    };

                    startup();

                    // if (!get().route && rpc) {
                    const blocknum = rpc.getBlockNumber();

                    let awaited: number;
                    await Promise.all([(awaited = await blocknum), startup()]);

                    updateBlocknum(awaited, chainId);
                    // }
                };

                return {
                    stake: undefined,
                    nuggft: undefined,
                    epoch: undefined,
                    epoch__id: 0,
                    route: undefined,
                    lastView: undefined,
                    lastSwap: undefined,
                    isViewOpen: false,
                    editingNugg: undefined,
                    activeSwaps: [],
                    activeItems: [],
                    liveOffers: {},
                    myNuggs: [],
                    myUnclaimedNuggOffers: [],
                    myUnclaimedItemOffers: [],
                    myRecents: new Set(),
                    myLoans: [],
                    activating: false,
                    blocknum: undefined,
                    error: undefined,
                    manualPriority: undefined,
                    liveTokens: {},
                    darkmode: {
                        user: undefined,
                        media: undefined,
                    },
                    locale: undefined,
                    searchFilter: {
                        target: undefined,
                        viewing: undefined,
                        sort: undefined,
                        searchValue: undefined,
                    },

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
                    routeTo,
                    toggleView,
                    toggleEditingNugg,
                    start,
                    updateToken,
                    updateLocale,
                    updateSearchFilterTarget,
                    updateSearchFilterViewing,
                    updateSearchFilterSort,
                    updateSearchFilterSearchValue,
                    updateUserDarkMode,
                    updateMediaDarkMode,
                };
            }),
        ),
    );
}
const core = createClientStoreAndActions2();

export const coreNonImmer = createClientStoreAndActions3();

export default core;
