/* eslint-disable no-param-reassign */
import { gql } from '@apollo/client';
import create, { State, StateCreator } from 'zustand';
import { BigNumber, BigNumberish } from 'ethers';
import produce, { Draft, enableMapSet } from 'immer';

import { Chain } from '@src/web3/core/interfaces';
import { extractItemId, parseItmeIdToNum } from '@src/lib';
import web3 from '@src/web3';
import config from '@src/config';
import { executeQuery3 } from '@src/graphql/helpers';

import { parseRoute, Route, TokenId, ItemId, NuggId } from './router';
import {
    ClientState,
    OfferData,
    UnclaimedNuggOffer,
    UnclaimedItemOffer,
    LoanData,
    MyNuggsData,
    ClientStateUpdate,
} from './interfaces';

enableMapSet();

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
                console.log('  new state', get());
            },
            get,
            api,
        );
    };

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
                        if (stateUpdate.rpc) draft.rpc = stateUpdate.rpc;
                        if (stateUpdate.editingNugg) draft.editingNugg = stateUpdate.editingNugg;
                        // @ts-ignore
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
                    set(({ myLoans }) => {
                        myLoans.filter((x) => x.nugg !== tokenId);
                    });
                }

                function removeNugg(tokenId: NuggId): void {
                    set((draft) => {
                        draft.myNuggs = draft.myNuggs.filter((x) => x.tokenId !== tokenId);
                    });
                }

                function removeNuggClaim(tokenId: NuggId): void {
                    set(({ myUnclaimedNuggOffers }) => {
                        myUnclaimedNuggOffers.filter((x) => x.tokenId !== tokenId);
                    });
                }

                function removeItemClaimIfMine(nuggId: NuggId, itemId: ItemId): void {
                    set((draft) => {
                        draft.myUnclaimedItemOffers.filter(
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
                        draft.activeOffers[tokenId] = mergeUnique([
                            ...offers,
                            ...(draft.activeOffers[tokenId] ?? []),
                        ]);
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

                async function updateClients(
                    stateUpdate: Pick<ClientStateUpdate, 'rpc' | 'graph'>,
                    chainId: Chain,
                ): Promise<void> {
                    set((draft) => {
                        // determine the next chainId and accounts
                        if (stateUpdate.rpc) draft.rpc = stateUpdate.rpc;
                        // @ts-ignore
                        if (stateUpdate.graph) draft.graph = stateUpdate.graph;
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
                    set((draft) => {
                        draft.editingNugg = tokenId;
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
