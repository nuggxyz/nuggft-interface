import { Web3Provider, WebSocketProvider } from '@ethersproject/providers';
import { ApolloClient, gql } from '@apollo/client';
import create, { State, StoreApi, UseBoundStore } from 'zustand';
import { BigNumber, BigNumberish } from 'ethers';

import { EthInt } from '@src/classes/Fraction';
import { Chain, Connector } from '@src/web3/core/interfaces';
import { extractItemId, parseItmeIdToNum } from '@src/lib';
import web3 from '@src/web3';
import config from '@src/config';
import { executeQuery3 } from '@src/graphql/helpers';

import { parseRoute, Route, SwapRoutes, ViewRoutes, TokenId, ItemId, NuggId } from './router';

export const DEFAULT_STATE: ClientState = {
    infura: undefined,
    stake: undefined,
    epoch: undefined,
    epoch__id: 0,
    route: undefined,
    lastView: undefined,
    lastSwap: undefined,
    isViewOpen: false,
    activeSwaps: [],
    activeItems: [],
    activeOffers: {},
    myNuggs: [],
    myUnclaimedNuggOffers: [],
    myUnclaimedItemOffers: [],
    myLoans: [],
    apollo: undefined,
    activating: false,
    blocknum: undefined,
    error: undefined,
    manualPriority: undefined,
};

export interface SwapData {
    id: TokenId;
    tokenId: TokenId;
    type: 'nugg' | 'item';
    dotnuggRawCache: Base64EncodedSvg;
    eth: EthInt;
    started: boolean;
    sellingNugg?: string;
    endingEpoch: number | null;
    isCurrent: boolean;
}

export interface LoanData {
    endingEpoch: number;
    eth: EthInt;
    nugg: NuggId;
    startingEpoch: number;
}
export interface DefaultExtraData {
    sender: string;
    chainId: Chain;
    provider: Web3Provider;
}

export interface OfferData {
    user: string;
    eth: EthInt;
    txhash: string;
}

export interface MyNuggsData {
    activeLoan: boolean;
    activeSwap: boolean;
    // svg: Base64EncodedSvg;
    tokenId: NuggId;
    unclaimedOffers: { itemId: ItemId; endingEpoch: number | null }[];
}
export interface BaseUnclaimedOffer {
    type: 'nugg' | 'item';
    tokenId: NuggId | ItemId;
    endingEpoch: number | null;
    eth: EthInt;
    leader: boolean;
    claimParams: {
        address: string;
        tokenId: string;
    };
}
export interface UnclaimedNuggOffer extends BaseUnclaimedOffer {
    type: 'nugg';
    tokenId: NuggId;
    claimParams: {
        address: string;
        tokenId: NuggId;
    };
}
export interface UnclaimedItemOffer extends BaseUnclaimedOffer {
    type: 'item';
    tokenId: ItemId;
    nugg: NuggId;
    claimParams: {
        address: NuggId;
        tokenId: string;
    };
}

export type UnclaimedOffer = UnclaimedNuggOffer | UnclaimedItemOffer;

export type StakeData = {
    staked: BigNumber;
    shares: BigNumber;
    eps: EthInt;
};

export type EpochData = {
    startblock: number;
    endblock: number;
    id: number;
    status: 'OVER' | 'ACTIVE' | 'PENDING';
};

export interface ClientState extends State {
    infura: WebSocketProvider | undefined;
    apollo: ApolloClient<any> | undefined;
    manualPriority: Connector | undefined;
    route: string | undefined;
    lastView: ViewRoutes | undefined;
    lastSwap: SwapRoutes | undefined;
    isViewOpen: boolean;
    stake: StakeData | undefined;
    epoch__id: number | undefined;
    epoch: EpochData | undefined;
    blocknum: number | undefined;
    activeOffers: Dictionary<OfferData[]>;
    activeSwaps: SwapData[];
    activeItems: SwapData[];
    myNuggs: MyNuggsData[];
    myUnclaimedNuggOffers: UnclaimedNuggOffer[];
    myUnclaimedItemOffers: UnclaimedItemOffer[];
    myLoans: LoanData[];
    error: Error | undefined;
    activating: boolean;
}

type ClientStateUpdate = {
    infura?: WebSocketProvider;
    apollo?: ApolloClient<unknown>;
    manualPriority?: Connector;
    // route?: string;
    stake?: {
        staked: BigNumber;
        shares: BigNumber;
        eps: EthInt;
    };
    epoch?: {
        startblock: number;
        endblock: number;
        id: number;
        status: 'OVER' | 'ACTIVE' | 'PENDING';
    };
    activeSwaps?: SwapData[];
    activeItems?: SwapData[];
    error?: Error;
    activating?: boolean;
    myNuggs?: MyNuggsData[];
    myUnclaimedNuggOffers?: UnclaimedNuggOffer[];
    myUnclaimedItemOffers?: UnclaimedItemOffer[];
    myLoans?: LoanData[];
};

export interface Actions {
    startActivation: () => () => void;
    updateBlocknum: (blocknum: number, chainId: Chain) => void;
    updateProtocol: (stateUpdate: ClientStateUpdate) => void;
    routeTo: (tokenId: `item-${string}` | string, view: boolean) => void;
    reportError: (error: Error | undefined) => void;
    toggleView: () => void;
    updateClients: (
        stateUpdate: Pick<ClientStateUpdate, 'infura' | 'apollo'>,
        chainId: Chain,
    ) => Promise<void>;

    updateOffers: (tokenId: TokenId, offers: OfferData[]) => void;

    removeLoan: (tokenId: NuggId) => void;
    removeNuggClaim: (tokenId: NuggId) => void;
    removeItemClaimIfMine: (buyingNuggId: NuggId, itemId: ItemId) => void;
    addNuggClaim: (update: UnclaimedNuggOffer) => void;
    addItemClaim: (update: UnclaimedItemOffer) => void;
    addLoan: (update: LoanData) => void;
    updateLoan: (update: LoanData) => void;

    addNugg: (update: MyNuggsData) => void;
    removeNugg: (tokenId: NuggId) => void;
}

export type ClientStore = StoreApi<ClientState> & UseBoundStore<ClientState>;

function createClientStoreAndActions(allowedChainIds?: number[]): {
    store: ClientStore;
    actions: Actions;
} {
    if (allowedChainIds?.length === 0) {
        throw new Error(`allowedChainIds is length 0`);
    }

    const store = create<ClientState>(() => DEFAULT_STATE);

    // flag for tracking updates so we don't clobber data when cancelling activation
    let nullifier = 0;

    /**
     * Sets activating to true, indicating that an update is in progress.
     *
     * @returns cancelActivation - A function that cancels the activation by setting activating to false,
     * as long as there haven't been any intervening updates.
     */
    function startActivation(): () => void {
        const nullifierCached = ++nullifier;

        store.setState({
            ...DEFAULT_STATE,
            activating: true,
        });

        // return a function that cancels the activation iff nothing else has happened
        return () => {
            if (nullifier === nullifierCached) {
                store.setState({ ...DEFAULT_STATE, activating: false });
            }
        };
    }

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
                { tokenId: tokenId },
            );

            if (route.type === Route.SwapNugg || route.type === Route.ViewNugg) {
                if (check.nugg === null) window.location.hash = '#/';
            } else if (route.type === Route.SwapItem || route.type === Route.ViewItem) {
                if (check.item === null) window.location.hash = '#/';
            }
        }
    }

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
                console.log({ parsed });
                if (parsed.type === Route.SwapNugg || parsed.type === Route.SwapItem) {
                    existingState = { ...existingState, lastSwap: parsed, isViewOpen: false };
                } else {
                    existingState = { ...existingState, lastView: parsed, isViewOpen: true };
                }

                existingState.route = window.location.hash;

                console.log(existingState);

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
        nullifier++;

        store.setState((existingState): ClientState => {
            // determine the next chainId and accounts
            // const epoch = stateUpdate.epoch ?? existingState.epoch;
            const stake = stateUpdate.stake ?? existingState.stake;
            const infura = stateUpdate.infura ?? existingState.infura;
            const apollo = stateUpdate.apollo ?? existingState.apollo;
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
            const error = existingState.error;

            return {
                ...existingState,
                manualPriority,
                infura,
                apollo,
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

            console.log({ existingState, updates });

            return updates;
        });
    }

    function routeTo(tokenId: string | `item-${string}`, view: boolean): void {
        store.setState((existingState): ClientState => {
            let route = '#/';

            let {
                lastView,
                lastSwap,
                isViewOpen,
                // lastView__tokenId,
                // lastSwap__tokenId,
                // lastView__type,
                // lastSwap__type,
            } = existingState;

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
                    // lastView__tokenId = tokenId;
                    // lastView__type = Route.ViewItem;
                    lastView = {
                        type: Route.ViewItem,
                        tokenId: tokenId as `item-${string}`,
                        ...num,
                    };
                } else {
                    // lastSwap__tokenId = tokenId;
                    // lastSwap__type = Route.SwapItem;
                    lastSwap = {
                        type: Route.SwapItem,
                        tokenId: tokenId as `item-${string}`,
                        ...num,
                    };
                }
            } else {
                route += 'nugg/' + tokenId;
                if (view) {
                    // lastView__tokenId = tokenId;
                    // lastView__type = Route.ViewNugg;
                    lastView = {
                        type: Route.ViewNugg,
                        tokenId: tokenId,
                        idnum: +tokenId,
                    };
                } else {
                    // lastSwap__tokenId = tokenId;
                    // lastSwap__type = Route.SwapNugg;
                    lastSwap = {
                        type: Route.SwapNugg,
                        tokenId: tokenId,
                        idnum: +tokenId,
                    };
                }
            }

            if (route !== existingState.route) {
                window.location.replace(route);
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
        stateUpdate: Pick<ClientStateUpdate, 'infura' | 'apollo'>,
        chainId: Chain,
    ): Promise<void> {
        nullifier++;

        store.setState((existingState): ClientState => {
            // determine the next chainId and accounts
            const infura = stateUpdate.infura ?? existingState.infura;
            const apollo = stateUpdate.apollo ?? existingState.apollo;

            // determine the next error
            const error = existingState.error;

            let activating = existingState.activating;
            if (activating && (error || (infura && apollo))) {
                activating = false;
            }

            return { ...existingState, infura, apollo, activating, error };
        });

        if (!store.getState().route && stateUpdate.infura) {
            const blocknum = stateUpdate.infura.getBlockNumber();

            let awaited: number;
            await Promise.all([(awaited = await blocknum), await checkVaildRouteOnStartup()]);

            updateBlocknum(awaited, chainId);
        }
    }

    // /**
    //  * Used to report an `error`, which clears all existing state.
    //  *
    //  * @param error - The error to report. If undefined, the state will be reset to its default value.
    //  */
    function reportError(error: Error | undefined): void {
        nullifier++;

        store.setState(() => ({ ...DEFAULT_STATE, error }));
    }

    const toggleView = () => {
        const isViewOpen = store.getState().isViewOpen;
        const lastSwap = store.getState().lastSwap;
        if (lastSwap) routeTo(lastSwap.tokenId, !isViewOpen);
        else routeTo('', !isViewOpen);
    };

    return {
        store,
        actions: {
            updateClients,
            startActivation,
            updateBlocknum,
            reportError,
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
        },
    };
}

export const core = createClientStoreAndActions();

export default core;

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
        if ((tmp = array5.indexOf(itm.user)) === -1) {
            array3.unshift(itm);
            array5.unshift(itm.user);
        } else {
            if (array3[tmp].eth.lt(itm.eth)) {
                array3[tmp] = itm;
                array5[tmp] = itm.user;
            }
        }
    }

    return array3.sort((a, b) => (a.eth.gt(b.eth) ? -1 : 1));
};
