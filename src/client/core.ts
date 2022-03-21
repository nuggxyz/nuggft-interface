/* eslint-disable no-param-reassign */
import { gql } from '@apollo/client';
import create, { StateCreator } from 'zustand';
import { BigNumber, BigNumberish } from 'ethers';
import { devtools } from 'zustand/middleware';

import { Chain } from '@src/web3/core/interfaces';
import { extractItemId, parseItmeIdToNum } from '@src/lib';
import web3 from '@src/web3';
import config from '@src/config';
import { executeQuery3 } from '@src/graphql/helpers';

import { parseRoute, Route, TokenId, ItemId, NuggId } from './router';
import {
    OfferData,
    ClientState,
    UnclaimedNuggOffer,
    UnclaimedItemOffer,
    LoanData,
    MyNuggsData,
    ClientStateUpdate,
} from './interfaces';

const calculateStartBlock = (epoch: BigNumberish, chainId: Chain) => {
    return BigNumber.from(epoch)
        .sub(config.EPOCH_OFFSET)
        .mul(web3.config.CONTRACTS[chainId].Interval)
        .add(web3.config.CONTRACTS[chainId].Genesis)
        .toNumber();
};

const calculateEpochId = (blocknum: number, chainId: Chain) => {
    return BigNumber.from(blocknum)
        .sub(web3.config.CONTRACTS[chainId].Genesis)
        .div(web3.config.CONTRACTS[chainId].Interval)
        .add(config.EPOCH_OFFSET)
        .toNumber();
};

const mergeUnique = (arr: OfferData[]) => {
    let len = arr.length;

    let tmp: number;
    const array3: OfferData[] = [];
    const array5: string[] = [];

    while (len--) {
        const itm = arr[len];
        // eslint-disable-next-line no-cond-assign
        if ((tmp = array5.indexOf(itm.user)) === -1) {
            array3.unshift(itm);
            array5.unshift(itm.user);
        } else if (array3[tmp].eth.lt(itm.eth)) {
            array3[tmp] = itm;
            array5[tmp] = itm.user;
        }
    }

    return array3.sort((a, b) => (a.eth.gt(b.eth) ? -1 : 1));
};

// const immer =
//     <
//         T extends State,
//         CustomSetState extends SetState<T>,
//         CustomGetState extends GetState<T>,
//         CustomStoreApi extends StoreApi<T>,
//     >(
//         _config: StateCreator<
//             T,
//             (partial: ((draft: Draft<T>) => void) | T, replace?: boolean) => void,
//             CustomGetState,
//             CustomStoreApi
//         >,
//     ): StateCreator<T, CustomSetState, CustomGetState, CustomStoreApi> =>
//     (set, get, api) =>
//         _config(
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

const log =
    (_config: StateCreator<ClientState>): StateCreator<ClientState> =>
    (set, get, api) =>
        _config(
            (args) => {
                console.log('  applying', args);
                set(args);
                console.log('  new state', get());
            },
            get,
            api,
        );

function createClientStoreAndActions2() {
    async function checkVaildRouteOnStartup(): Promise<void> {
        const route = parseRoute(window.location.hash);

        if (route.type !== Route.Home) {
            const tokenId = extractItemId(route.tokenId);
            const isItem = tokenId.startsWith('item-');
            const check = await executeQuery3<{
                nugg: { id: string };
                item: { id: string };
            }>(
                gql`
                    query Check($tokenId: ID!) {
                        ${isItem ? 'item' : 'nugg'}(id: $tokenId) {
                            id
                        }
                    }
                `,
                { tokenId },
            );

            if (route.type === Route.SwapNugg || route.type === Route.ViewNugg) {
                if (check.nugg === null) window.location.hash = '#/';
            } else if (route.type === Route.SwapItem || route.type === Route.ViewItem) {
                if (check.item === null) window.location.hash = '#/';
            }
        }
    }

    return create<ClientState>(
        devtools(
            log((set, get) => {
                function updateBlocknum(blocknum: number, chainId: Chain) {
                    const epochId = calculateEpochId(blocknum, chainId);

                    set((existingState): ClientState => {
                        if (!existingState.route) {
                            let parsed = parseRoute(window.location.hash);
                            if (parsed.type === Route.Home) {
                                parsed = {
                                    type: Route.SwapNugg,
                                    tokenId: epochId.toString(),
                                    idnum: epochId,
                                };
                            }

                            if (parsed.type === Route.SwapNugg || parsed.type === Route.SwapItem) {
                                existingState = {
                                    ...existingState,
                                    lastSwap: parsed,
                                    isViewOpen: false,
                                };
                            } else {
                                existingState = {
                                    ...existingState,
                                    lastView: parsed,
                                    isViewOpen: true,
                                };
                            }

                            existingState.route = window.location.hash;

                            if (!existingState.lastSwap) {
                                existingState.lastSwap = {
                                    type: Route.SwapNugg,
                                    tokenId: epochId.toString(),
                                    idnum: epochId,
                                };
                            }
                        }

                        if (!existingState.epoch || epochId !== existingState.epoch.id) {
                            existingState.epoch = {
                                id: epochId,
                                startblock: calculateStartBlock(epochId, chainId),
                                endblock: calculateStartBlock(epochId + 1, chainId) - 1,
                                status: 'ACTIVE',
                            };
                        }
                        return {
                            ...existingState,
                            blocknum,
                        };
                    });
                }

                function updateProtocol(stateUpdate: ClientStateUpdate): void {
                    set((existingState): ClientState => {
                        const stake = stateUpdate.stake ?? existingState.stake;
                        const rpc = stateUpdate.rpc ?? existingState.rpc;
                        const editingNugg = stateUpdate.editingNugg ?? existingState.editingNugg;

                        const graph = stateUpdate.graph ?? existingState.graph;
                        const activeSwaps = stateUpdate.activeSwaps ?? existingState.activeSwaps;
                        const activeItems = stateUpdate.activeItems ?? existingState.activeItems;
                        const manualPriority =
                            stateUpdate.manualPriority ?? existingState.manualPriority;
                        const myNuggs = stateUpdate.myNuggs ?? existingState.myNuggs;
                        const myLoans = stateUpdate.myLoans ?? existingState.myLoans;

                        const myUnclaimedNuggOffers =
                            stateUpdate.myUnclaimedNuggOffers ??
                            existingState.myUnclaimedNuggOffers;
                        const myUnclaimedItemOffers =
                            stateUpdate.myUnclaimedItemOffers ??
                            existingState.myUnclaimedItemOffers;
                        // determine the next error
                        const { error } = existingState;

                        return {
                            ...existingState,
                            editingNugg,
                            manualPriority,
                            rpc,
                            graph,
                            myNuggs,
                            myUnclaimedNuggOffers,
                            myUnclaimedItemOffers,
                            myLoans,
                            stake,
                            activeSwaps,
                            activeItems,
                            error,
                        };
                    });
                }

                function removeLoan(tokenId: NuggId): void {
                    set((existingState): ClientState => {
                        return {
                            ...existingState,
                            myLoans: existingState.myLoans.filter((x) => x.nugg !== tokenId),
                        };
                    });
                }

                function removeNugg(tokenId: NuggId): void {
                    set((existingState): ClientState => {
                        return {
                            ...existingState,
                            myNuggs: existingState.myNuggs.filter((x) => x.tokenId !== tokenId),
                        };
                    });
                }

                function removeNuggClaim(tokenId: NuggId): void {
                    set((existingState): ClientState => {
                        return {
                            ...existingState,
                            myUnclaimedNuggOffers: existingState.myUnclaimedNuggOffers.filter(
                                (x) => x.tokenId !== tokenId,
                            ),
                        };
                    });
                }

                function removeItemClaimIfMine(nuggId: NuggId, itemId: ItemId): void {
                    set((existingState): ClientState => {
                        return {
                            ...existingState,
                            myUnclaimedItemOffers: existingState.myUnclaimedItemOffers.filter(
                                (x) => x.nugg !== nuggId || x.tokenId !== itemId,
                            ),
                        };
                    });
                }

                function addNuggClaim(update: UnclaimedNuggOffer): void {
                    set((existingState): ClientState => {
                        return {
                            ...existingState,
                            myUnclaimedNuggOffers: [update, ...existingState.myUnclaimedNuggOffers],
                        };
                    });
                }

                function addItemClaim(update: UnclaimedItemOffer): void {
                    set((existingState): ClientState => {
                        return {
                            ...existingState,
                            myUnclaimedItemOffers: [update, ...existingState.myUnclaimedItemOffers],
                        };
                    });
                }

                function addLoan(update: LoanData): void {
                    set((existingState): ClientState => {
                        return {
                            ...existingState,
                            myLoans: [update, ...existingState.myLoans],
                        };
                    });
                }

                function updateLoan(update: LoanData): void {
                    set((existingState): ClientState => {
                        return {
                            ...existingState,
                            myLoans: [
                                update,
                                ...existingState.myLoans.filter((x) => x.nugg !== update.nugg),
                            ],
                        };
                    });
                }

                function addNugg(update: MyNuggsData): void {
                    set((existingState): ClientState => {
                        return {
                            ...existingState,
                            myNuggs: [update, ...existingState.myNuggs],
                        };
                    });
                }

                function updateOffers(tokenId: TokenId, offers: OfferData[]): void {
                    set((existingState): ClientState => {
                        const updates = {
                            ...existingState,
                            activeOffers: {
                                ...existingState.activeOffers,
                                [tokenId]: mergeUnique([
                                    ...offers,
                                    ...(existingState.activeOffers[tokenId] ?? []),
                                ]),
                            },
                        };

                        return updates;
                    });
                }

                function routeTo(tokenId: string | `item-${string}`, view: boolean): void {
                    set((existingState): ClientState => {
                        let route = '#/';

                        let { lastView, lastSwap, isViewOpen } = existingState;

                        const isItem = tokenId?.includes('item-');

                        if (view) {
                            route += 'view/';
                            isViewOpen = true;
                        } else {
                            isViewOpen = false;
                        }

                        if (isItem) {
                            route += 'item/';
                            const num = parseItmeIdToNum(tokenId as `item-${string}`);
                            route += `${num.feature}/`;
                            route += num.position;
                            if (view) {
                                lastView = {
                                    type: Route.ViewItem,
                                    tokenId: tokenId as `item-${string}`,
                                    ...num,
                                };
                            } else {
                                lastSwap = {
                                    type: Route.SwapItem,
                                    tokenId: tokenId as `item-${string}`,
                                    ...num,
                                };
                            }
                        } else {
                            route += `nugg/${tokenId}`;
                            if (view) {
                                lastView = {
                                    type: Route.ViewNugg,
                                    tokenId,
                                    idnum: +tokenId,
                                };
                            } else {
                                lastSwap = {
                                    type: Route.SwapNugg,
                                    tokenId,
                                    idnum: +tokenId,
                                };
                            }
                        }

                        if (route !== existingState.route) {
                            window.location.replace(route);
                        }
                        if (view && lastView) {
                            const save = JSON.stringify({
                                id: lastView.tokenId,
                                type: lastView.type === Route.ViewNugg ? 'nugg' : 'item',
                                dotnuggRawCache: null,
                            });
                            if (existingState.myRecents.has(save)) {
                                existingState.myRecents.delete(save);
                            }
                            existingState.myRecents.add(save);
                        } else if (lastSwap) {
                            const save = JSON.stringify({
                                id: lastSwap.tokenId,
                                type: lastSwap.type === Route.SwapNugg ? 'nugg' : 'item',
                                dotnuggRawCache: null,
                            });
                            if (existingState.myRecents.has(save)) {
                                existingState.myRecents.delete(save);
                            }
                            existingState.myRecents.add(save);
                        }

                        return {
                            ...existingState,
                            ...(route === existingState.route ? {} : { route }),
                            ...(lastView &&
                            existingState.lastView &&
                            lastView.tokenId === existingState.lastView.tokenId
                                ? {}
                                : { lastView }),
                            ...(lastSwap &&
                            existingState.lastSwap &&
                            lastSwap.tokenId === existingState.lastSwap.tokenId
                                ? {}
                                : { lastSwap }),
                            ...(isViewOpen === existingState.isViewOpen ? {} : { isViewOpen }),
                        };
                    });
                }

                async function updateClients(
                    stateUpdate: Pick<ClientStateUpdate, 'rpc' | 'graph'>,
                    chainId: Chain,
                ): Promise<void> {
                    set((existingState): ClientState => {
                        // determine the next chainId and accounts
                        const rpc = stateUpdate.rpc ?? existingState.rpc;
                        const graph = stateUpdate.graph ?? existingState.graph;

                        // determine the next error
                        const { error } = existingState;

                        let { activating } = existingState;
                        if (activating && (error || (rpc && graph))) {
                            activating = false;
                        }

                        return { ...existingState, rpc, graph, activating, error };
                    });

                    if (!get().route && stateUpdate.rpc) {
                        const blocknum = stateUpdate.rpc.getBlockNumber();

                        let awaited: number;
                        await Promise.all([
                            (awaited = await blocknum),
                            await checkVaildRouteOnStartup(),
                        ]);

                        updateBlocknum(awaited, chainId);
                    }
                }

                const toggleView = () => {
                    const { isViewOpen } = get();
                    const { lastSwap } = get();
                    if (lastSwap) routeTo(lastSwap.tokenId, !isViewOpen);
                    else routeTo('', !isViewOpen);
                };

                const toggleEditingNugg = (tokenId: NuggId | undefined) => {
                    set((existingState): ClientState => {
                        return { ...existingState, editingNugg: tokenId };
                    });
                };

                return {
                    rpc: undefined,
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
                    activeOffers: {},
                    myNuggs: [],
                    myUnclaimedNuggOffers: [],
                    myUnclaimedItemOffers: [],
                    myRecents: new Set(),
                    myLoans: [],
                    graph: undefined,
                    activating: false,
                    blocknum: undefined,
                    error: undefined,
                    manualPriority: undefined,

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
                    updateClients,
                    toggleEditingNugg,
                };
            }),
        ),
    );
}
const core = createClientStoreAndActions2();

export default core;
