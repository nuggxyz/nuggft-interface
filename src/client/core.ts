import { InfuraWebSocketProvider } from '@ethersproject/providers';
import { ApolloClient } from '@apollo/client';
import create, { State, StoreApi, UseBoundStore } from 'zustand';
import { BigNumber } from 'ethers';

import { EthInt } from '@src/classes/Fraction';
import { Connector } from '@src/web3/core/interfaces';

const DEFAULT_STATE = {
    infura: undefined,
    stake: undefined,
    epoch: undefined,
    activeSwaps: [],
    myNuggs: [],
    apollo: undefined,
    activating: false,
    error: undefined,
    manualPriority: undefined,
};

export interface ClientState extends State {
    infura: InfuraWebSocketProvider | undefined;
    apollo: ApolloClient<any> | undefined;
    manualPriority: Connector;
    stake: {
        staked: BigNumber;
        shares: BigNumber;
        eps: EthInt;
    };
    epoch: {
        startBlock: number;
        endBlock: number;
        id: number;
        status: 'OVER' | 'ACTIVE' | 'PENDING';
    };
    activeSwaps: { id: string; dotnuggRawCache: string }[];
    myNuggs: NL.GraphQL.Fragments.Nugg.ListItem[];
    error: Error | undefined;
    activating: boolean;
}

type ClientStateUpdate = {
    infura?: InfuraWebSocketProvider;
    apollo?: ApolloClient<any>;
    manualPriority?: Connector;
    stake?: {
        staked: BigNumber;
        shares: BigNumber;
        eps: EthInt;
    };
    epoch?: {
        startBlock: number;
        endBlock: number;
        id: number;
        status: 'OVER' | 'ACTIVE' | 'PENDING';
    };
    activeSwaps?: { id: string; dotnuggRawCache: string }[];
    myNuggs?: NL.GraphQL.Fragments.Nugg.ListItem[];
    error?: Error;
    activating?: boolean;
};

export interface Actions {
    startActivation: () => () => void;
    update: (stateUpdate: ClientStateUpdate) => void;
    updateProtocol: (stateUpdate: ClientStateUpdate) => void;
    reportError: (error: Error | undefined) => void;
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

        store.setState({ ...DEFAULT_STATE, activating: true });

        // return a function that cancels the activation iff nothing else has happened
        return () => {
            if (nullifier === nullifierCached) {
                store.setState({ ...DEFAULT_STATE, activating: false });
            }
        };
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
            const epoch = stateUpdate.epoch ?? existingState.epoch;
            const stake = stateUpdate.stake ?? existingState.stake;
            const infura = stateUpdate.infura ?? existingState.infura;
            const apollo = stateUpdate.apollo ?? existingState.apollo;
            const activeSwaps = stateUpdate.activeSwaps ?? existingState.activeSwaps;
            const myNuggs = stateUpdate.myNuggs ?? existingState.myNuggs;
            const manualPriority = stateUpdate.manualPriority ?? existingState.manualPriority;

            // determine the next error
            let error = existingState.error;

            // let activating = existingState.activating;
            // if (activating && (error || (infura && apollo))) {
            //     activating = false;
            // }

            return {
                ...existingState,
                manualPriority,
                myNuggs,
                infura,
                apollo,
                epoch,
                stake,
                activeSwaps,
                error,
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
    function update(stateUpdate: ClientStateUpdate): void {
        nullifier++;

        store.setState((existingState): ClientState => {
            // determine the next chainId and accounts
            const infura = stateUpdate.infura ?? existingState.infura;
            const apollo = stateUpdate.apollo ?? existingState.apollo;

            // determine the next error
            let error = existingState.error;

            let activating = existingState.activating;
            if (activating && (error || (infura && apollo))) {
                activating = false;
            }

            return { ...existingState, infura, apollo, activating, error };
        });
    }

    /**
     * Used to report an `error`, which clears all existing state.
     *
     * @param error - The error to report. If undefined, the state will be reset to its default value.
     */
    function reportError(error: Error | undefined): void {
        nullifier++;

        store.setState(() => ({ ...DEFAULT_STATE, error }));
    }

    return { store, actions: { startActivation, update, reportError, updateProtocol } };
}

export const core = createClientStoreAndActions();

export default core;
