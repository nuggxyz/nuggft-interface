/* eslint-disable no-param-reassign */
import { gql } from '@apollo/client';
import create from 'zustand';
import { BigNumber, BigNumberish } from 'ethers';

import { Chain } from '@src/web3/core/interfaces';
import { extractItemId, parseItmeIdToNum } from '@src/lib';
import web3 from '@src/web3';
import config from '@src/config';
import { executeQuery3 } from '@src/graphql/helpers';

import { parseRoute, Route, TokenId, ItemId, NuggId } from './router';
import {
    OfferData,
    ClientStore,
    ClientState,
    UnclaimedNuggOffer,
    UnclaimedItemOffer,
    LoanData,
    MyNuggsData,
    ClientStateUpdate,
    Actions,
    DEFAULT_STATE,
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

// const log =
//     (_config: StateCreator<ClientState>): StateCreator<ClientState> =>
//     (set, get, api) =>
//         _config(
//             (args) => {
//                 console.log('  applying', args);
//                 set(args);
//                 console.log('  new state', get());
//             },
//             get,
//             api,
//         );

function createClientStoreAndActions(): {
    store: ClientStore;
    actions: Actions;
} {
    const store = create<ClientState>(() => DEFAULT_STATE);

    // flag for tracking updates so we don't clobber data when cancelling activation

    async function checkVaildRouteOnStartup(): Promise<void> {
        const route = parseRoute(window.location.hash);

        if (route.type !== Route.Home) {
            const tokenId = extractItemId(route.tokenId);
            const isItem = tokenId.startsWith('item-');
            const check = await executeQuery3<{
                nugg?: { id: string };
                item?: { id: string };
            }>(
                gql`
                    query Check($tokenId: ID!) {
                        ${isItem ? 'item' : 'nugg'}(id: $tokenId) {
                            id
                        }
                    }
                `,
                { tokenId: extractItemId(tokenId) },
            );

            if (route.type === Route.SwapNugg || route.type === Route.ViewNugg) {
                if (check.nugg === undefined) window.location.hash = '#/';
            } else if (route.type === Route.SwapItem || route.type === Route.ViewItem) {
                if (check.item === undefined) window.location.hash = '#/';
            }
        }
    }

    // function updateLifecycle(lifecycle: Lifecycle) {
    //     store.setState((existingState): ClientState => {
    //         return {
    //             ...existingState,
    //             activeLifecycle: lifecycle,
    //         };
    //     });
    // }

    // function updateToken(token?: LiveToken) {
    //     store.setState((existingState): ClientState => {
    //         return {
    //             ...existingState,
    //             activeToken: token,
    //         };
    //     });
    // }

    /**
     * Sets activating to true, indicating that an update is in progress.
     *
     * @returns cancelActivation - A function that cancels the activation by setting activating to false,
     * as long as there haven't been any intervening updates.
     */
    function updateBlocknum(blocknum: number, chainId: Chain) {
        const epochId = calculateEpochId(blocknum, chainId);

        store.setState((existingState): ClientState => {
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
                    existingState = { ...existingState, lastSwap: parsed, isViewOpen: false };
                } else {
                    existingState = { ...existingState, lastView: parsed, isViewOpen: true };
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

    /**
     * Sets activating to true, indicating that an update is in progress.
     *
     * @returns cancelActivation - A function that cancels the activation by setting activating to false,
     * as long as there haven't been any intervening updates.
     */
    function updateProtocol(stateUpdate: ClientStateUpdate): void {
        store.setState((existingState): ClientState => {
            const stake = stateUpdate.stake ?? existingState.stake;
            const rpc = stateUpdate.rpc ?? existingState.rpc;
            const editingNugg = stateUpdate.editingNugg ?? existingState.editingNugg;

            const graph = stateUpdate.graph ?? existingState.graph;
            const activeSwaps = stateUpdate.activeSwaps ?? existingState.activeSwaps;
            const activeItems = stateUpdate.activeItems ?? existingState.activeItems;
            const manualPriority = stateUpdate.manualPriority ?? existingState.manualPriority;
            const myNuggs = stateUpdate.myNuggs ?? existingState.myNuggs;
            const myLoans = stateUpdate.myLoans ?? existingState.myLoans;

            const myUnclaimedNuggOffers =
                stateUpdate.myUnclaimedNuggOffers ?? existingState.myUnclaimedNuggOffers;
            const myUnclaimedItemOffers =
                stateUpdate.myUnclaimedItemOffers ?? existingState.myUnclaimedItemOffers;
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
        store.setState((existingState): ClientState => {
            return {
                ...existingState,
                myLoans: existingState.myLoans.filter((x) => x.nugg !== tokenId),
            };
        });
    }

    function removeNugg(tokenId: NuggId): void {
        store.setState((existingState): ClientState => {
            return {
                ...existingState,
                myNuggs: existingState.myNuggs.filter((x) => x.tokenId !== tokenId),
            };
        });
    }

    function removeNuggClaim(tokenId: NuggId): void {
        store.setState((existingState): ClientState => {
            return {
                ...existingState,
                myUnclaimedNuggOffers: existingState.myUnclaimedNuggOffers.filter(
                    (x) => x.tokenId !== tokenId,
                ),
            };
        });
    }

    function removeItemClaimIfMine(nuggId: NuggId, itemId: ItemId): void {
        store.setState((existingState): ClientState => {
            return {
                ...existingState,
                myUnclaimedItemOffers: existingState.myUnclaimedItemOffers.filter(
                    (x) => x.nugg !== nuggId || x.tokenId !== itemId,
                ),
            };
        });
    }

    function addNuggClaim(update: UnclaimedNuggOffer): void {
        store.setState((existingState): ClientState => {
            return {
                ...existingState,
                myUnclaimedNuggOffers: [update, ...existingState.myUnclaimedNuggOffers],
            };
        });
    }

    function addItemClaim(update: UnclaimedItemOffer): void {
        store.setState((existingState): ClientState => {
            return {
                ...existingState,
                myUnclaimedItemOffers: [update, ...existingState.myUnclaimedItemOffers],
            };
        });
    }

    function addLoan(update: LoanData): void {
        store.setState((existingState): ClientState => {
            return {
                ...existingState,
                myLoans: [update, ...existingState.myLoans],
            };
        });
    }

    function updateLoan(update: LoanData): void {
        store.setState((existingState): ClientState => {
            return {
                ...existingState,
                myLoans: [update, ...existingState.myLoans.filter((x) => x.nugg !== update.nugg)],
            };
        });
    }

    function addNugg(update: MyNuggsData): void {
        store.setState((existingState): ClientState => {
            return {
                ...existingState,
                myNuggs: [update, ...existingState.myNuggs],
            };
        });
    }

    /**
     * Sets activating to true, indicating that an update is in progress.
     *
     * @returns cancelActivation - A function that cancels the activation by setting activating to false,
     * as long as there haven't been any intervening updates.
     */
    function updateOffers(tokenId: TokenId, offers: OfferData[]): void {
        store.setState((existingState): ClientState => {
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
        store.setState((existingState): ClientState => {
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

    /**
     * Used to report a `stateUpdate` which is merged with existing state. The first `stateUpdate` that results in chainId
     * and accounts being set will also set activating to false, indicating a successful connection. Similarly, if an
     * error is set, the first `stateUpdate` that results in chainId and accounts being set will clear this error.
     *
     * @param stateUpdate - The state update to report.
     */
    async function updateClients(
        stateUpdate: Pick<ClientStateUpdate, 'rpc' | 'graph'>,
        chainId: Chain,
    ): Promise<void> {
        store.setState((existingState): ClientState => {
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

        if (!store.getState().route && stateUpdate.rpc) {
            const blocknum = stateUpdate.rpc.getBlockNumber();

            let awaited: number;
            await Promise.all([(awaited = await blocknum), await checkVaildRouteOnStartup()]);

            updateBlocknum(awaited, chainId);
        }
    }

    const toggleView = () => {
        const { isViewOpen } = store.getState();
        const { lastSwap } = store.getState();
        if (lastSwap) routeTo(lastSwap.tokenId, !isViewOpen);
        else routeTo('', !isViewOpen);
    };

    const toggleEditingNugg = (tokenId: NuggId | undefined) => {
        store.setState((existingState): ClientState => {
            return { ...existingState, editingNugg: tokenId };
        });
    };

    return {
        store,
        actions: {
            updateClients,
            updateBlocknum,
            updateProtocol,
            routeTo,
            toggleView,
            updateOffers,
            removeLoan,
            removeNuggClaim,
            removeItemClaimIfMine,
            addNuggClaim,
            addItemClaim,
            addLoan,
            addNugg,
            removeNugg,
            updateLoan,
            toggleEditingNugg,
        },
    };
}

const core = createClientStoreAndActions();

export default core;
