import { InfuraWebSocketProvider } from '@ethersproject/providers';
import { ApolloClient } from '@apollo/client';
import create, { State, StoreApi } from 'zustand';

import { useSafeLiveOffers, useLiveOffers } from './hooks/useLiveOffers';
import { useSafeLiveStake, useLiveStake } from './hooks/useLiveStake';
import updater from './updater';
const DEFAULT_STATE = {
    infura: undefined,
    apollo: undefined,
    activating: false,
    error: undefined,
};

export interface ClientState extends State {
    infura: InfuraWebSocketProvider | undefined;
    apollo: ApolloClient<any> | undefined;
    error: Error | undefined;
    activating: boolean;
}

export type ClientStateUpdate =
    | {
          infura: InfuraWebSocketProvider;
          apollo: ApolloClient<any>;
      }
    | {
          infura: InfuraWebSocketProvider;
          apollo?: never;
      }
    | {
          infura?: never;
          apollo: ApolloClient<any>;
      };

export interface Actions {
    startActivation: () => () => void;
    update: (stateUpdate: ClientStateUpdate) => void;
    reportError: (error: Error | undefined) => void;
}

export type ClientStore = StoreApi<ClientState>;

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
            // if (chainId && allowedChainIds) {
            //     // if we have a chainId allowlist and a chainId, we need to ensure it's allowed
            //     const chainIdError = ensureChainIdIsAllowed(chainId, allowedChainIds);

            //     // warn if we're going to clobber existing error
            //     // if (chainIdError && error) {
            //     //     if (
            //     //         !(error instanceof ChainIdNotAllowedError) ||
            //     //         error.chainId !== chainIdError.chainId
            //     //     ) {
            //     //         console.debug(`${error.name} is being clobbered by ${chainIdError.name}`);
            //     //     }
            //     // }

            //     error = chainIdError;
            // }

            // ensure that the activating flag is cleared when appropriate
            let activating = existingState.activating;
            if (activating && (error || (infura && apollo))) {
                activating = false;
            }

            return { infura, apollo, activating, error };
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

    return { store, actions: { startActivation, update, reportError } };
}

export const core = createClientStoreAndActions();

const useApollo = () => {
    return core.store.getState().apollo;
};

const useInfura = () => {
    return core.store.getState().infura;
};

export default {
    core,
    useApollo,
    useInfura,
    updater,
    getApollo: () => core.store.getState().apollo,
    getInfura: () => core.store.getState().apollo,
    useSafeLiveOffers,
    useLiveOffers,
    useSafeLiveStake,
    useLiveStake,
};
