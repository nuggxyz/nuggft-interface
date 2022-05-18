/* eslint-disable no-use-before-define */
import type { Networkish } from '@ethersproject/networks';
import type { TransactionReceipt } from '@ethersproject/providers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { EqualityChecker, StoreApi, UseBoundStore } from 'zustand';
import create from 'zustand';
import { PopulatedTransaction } from 'ethers';

import { Address } from '@src/classes/Address';
import client from '@src/client';
import { EthInt } from '@src/classes/Fraction';
// eslint-disable-next-line import/no-cycle
import { CONTRACTS } from '@src/web3/config';
import type { CustomWeb3Provider } from '@src/web3/classes/CustomWeb3Provider';
// eslint-disable-next-line import/no-cycle
// eslint-disable-next-line import/no-cycle

import { createWeb3ReactStoreAndActions } from './store';
import { Connector, Web3ReactStore, Web3ReactState, Actions, CoreProvider } from './types';
import { Connector as ConnectorEnum, Chain } from './interfaces';

export type Web3ReactHooks = ReturnType<typeof getStateHooks> &
    ReturnType<typeof getDerivedHooks> &
    ReturnType<typeof getAugmentedHooks>;

export type Web3ReactSelectedHooks = ReturnType<typeof getSelectedConnector>;

export type Web3ReactPriorityHooks = ReturnType<typeof getPriorityConnector>;

export type ResWithStore<T extends Connector> = Res<T> & {
    store: Web3ReactStore;
};

export type Res<T extends Connector> = {
    connector: T;
    hooks: Web3ReactHooks;
};

/**
 * Wraps the initialization of a `connector`. Creates a zustand `store` with `actions` bound to it, and then passes
 * these to the connector as specified in `f`. Also creates a variety of `hooks` bound to this `store`.
 *
 * @typeParam T - The type of the `connector` returned from `f`.
 * @param f - A function which is called with `actions` bound to the returned `store`.
 * @param allowedChainIds - An optional array of chainIds which the `connector` may connect to. If the `connector` is
 * connected to a chainId which is not allowed, a ChainIdNotAllowedError error will be reported.
 * If this argument is unspecified, the `connector` may connect to any chainId.
 * @returns [connector, hooks, store] - The initialized connector, a variety of hooks, and a zustand store.
 */
export function initializeConnector<T extends Connector>(
    f: (actions: Actions) => T,
    allowedChainIds?: number[],
): ResWithStore<T> {
    const [store, actions] = createWeb3ReactStoreAndActions(allowedChainIds);

    const connector = f(actions);
    const useConnector = create<Web3ReactStore>(store);

    const stateHooks = getStateHooks(useConnector);
    const derivedHooks = getDerivedHooks(stateHooks);
    const augmentedHooks = getAugmentedHooks(connector, stateHooks, derivedHooks);

    return { connector, hooks: { ...stateHooks, ...derivedHooks, ...augmentedHooks }, store };
}

function computeIsActive({ chainId, peer, accounts, activating, error }: Web3ReactState) {
    return Boolean(chainId && peer && accounts && !activating && !error);
}

/**
 * Creates a variety of convenience `hooks` that return data associated with a particular passed connector.
 *
 * @param initializedConnectors - Two or more [connector, hooks] arrays, as returned from initializeConnector.
 * @returns hooks - A variety of convenience hooks that wrap the hooks returned from initializeConnector.
 */
export function getSelectedConnector(...initializedConnectors: Res<Connector>[]) {
    function getIndex(connector: Connector) {
        const index = initializedConnectors.findIndex(
            (initializedConnector) => connector === initializedConnector.connector,
        );
        if (index === -1) throw new Error('Connector not found');
        return index;
    }

    // the following code calls hooks in a map a lot, which violates the eslint rule.
    // this is ok, though, because initializedConnectors never changes, so the same hooks are called each time
    function useSelectedChainId(connector: Connector) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const values = initializedConnectors.map((x) => x.hooks.useChainId());
        return values[getIndex(connector)];
    }

    function useSelectedAccounts(connector: Connector) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const values = initializedConnectors.map((x) => x.hooks.useAccounts());
        return values[getIndex(connector)];
    }

    function useSelectedPeer(connector: Connector) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const values = initializedConnectors.map((x) => x.hooks.usePeer());
        return values[getIndex(connector)];
    }

    function useSelectedIsActivating(connector: Connector) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const values = initializedConnectors.map((x) => x.hooks.useIsActivating());
        return values[getIndex(connector)];
    }

    function useSelectedError(connector: Connector) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const values = initializedConnectors.map((x) => x.hooks.useError());
        return values[getIndex(connector)];
    }

    function useSelectedAccount(connector: Connector) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const values = initializedConnectors.map((x) => x.hooks.useAccount());
        return values[getIndex(connector)]?.toLowerCase();
    }

    function useSelectedIsActive(connector: Connector) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const values = initializedConnectors.map((x) => x.hooks.useIsActive());
        return values[getIndex(connector)];
    }

    function useSelectedProvider(connector: Connector, network?: Networkish) {
        const index = getIndex(connector);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const values = initializedConnectors.map((x, i) =>
            x.hooks.useProvider(network, i === index),
        );
        return values[index];
    }

    function useSelectedCoreProvider(connector: Connector, network?: Networkish) {
        const index = getIndex(connector);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const values = initializedConnectors.map((x, i) =>
            x.hooks.useCoreProvider(network, i === index),
        );
        return values[index];
    }

    function useSelectedENSName(connector: Connector, provider: CustomWeb3Provider | undefined) {
        const index = getIndex(connector);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const values = initializedConnectors.map((x, i) =>
            x.hooks.useENSName(i === index ? provider : undefined),
        );
        return values[index];
    }

    function useSelectedWeb3React(connector: Connector, provider: CustomWeb3Provider | undefined) {
        const index = getIndex(connector);
        const values = initializedConnectors.map((x, i) =>
            x.hooks.useWeb3React(i === index ? provider : undefined),
        );
        return values[index];
    }

    function useSelectedAnyENSName(
        connector: Connector,
        provider: CustomWeb3Provider | 'nugg' | undefined,
        account: string,
    ) {
        const index = getIndex(connector);
        const values = initializedConnectors.map((x, i) =>
            x.hooks.useAnyENSName(i === index ? provider : undefined, account),
        );
        return values[index];
    }

    function useSelectedBalance(connector: Connector, provider: CustomWeb3Provider | undefined) {
        const account = useSelectedAccount(connector);
        return useBalance(provider, account);
    }

    function useSelectedTx(connector: Connector, hash: string) {
        const provider = useSelectedProvider(connector);
        return useTx(provider, hash);
    }

    function useSelectedTransactionManager(connector: Connector) {
        const provider = useSelectedProvider(connector);
        return useTransactionManager(provider);
    }

    return {
        useSelectedChainId,
        useSelectedAccounts,
        useSelectedIsActivating,
        useSelectedError,
        useSelectedAccount,
        useSelectedIsActive,
        useSelectedProvider,
        useSelectedENSName,
        useSelectedWeb3React,
        useSelectedAnyENSName,
        useSelectedBalance,
        useSelectedPeer,
        useSelectedTx,
        useSelectedTransactionManager,
        useSelectedCoreProvider,
    };
}

/**
 * Creates a variety of convenience `hooks` that return data associated with the first of the `initializedConnectors`
 * that is active.
 *
 * @param initializedConnectors - Two or more [connector, hooks] arrays, as returned from initializeConnector.
 * @returns hooks - A variety of convenience hooks that wrap the hooks returned from initializeConnector.
 */
export function getNetworkConnector(initializedConnectors: {
    [key in ConnectorEnum]?: ResWithStore<Connector>;
}) {
    const {
        useSelectedChainId,
        useSelectedAccounts,
        useSelectedIsActivating,
        useSelectedError,
        useSelectedAccount,
        useSelectedIsActive,
        useSelectedProvider,
        useSelectedENSName,
        useSelectedWeb3React,
        useSelectedAnyENSName,
        useSelectedBalance,
        useSelectedPeer,
        useSelectedTx,
    } = getSelectedConnector(...Object.values(initializedConnectors));

    function useNetworkConnector() {
        return initializedConnectors.rpc!.connector;

        // // eslint-disable-next-line react-hooks/rules-of-hooks
        // const values = Object.values(initializedConnectors).map((x) => {
        //     const peer = Object.values(x.connector.peers)[0];
        //     // console.log(peer);
        //     return !!peer?.fallback;
        // });
        // console.log(values);
        // const index = values.findIndex((x) => x);
        // const res = Object.values(initializedConnectors)[index === -1 ? 0 : index];

        // console.log({ res });
        // return res.connector;
    }

    function useNetworkChainId() {
        return useSelectedChainId(useNetworkConnector());
    }

    function useNetworkAccounts() {
        return useSelectedAccounts(useNetworkConnector());
    }

    function useNetworkIsActivating() {
        return useSelectedIsActivating(useNetworkConnector());
    }

    function useNetworkError() {
        return useSelectedError(useNetworkConnector());
    }

    function useNetworkAccount() {
        return useSelectedAccount(useNetworkConnector());
    }

    function useNetworkIsActive() {
        return useSelectedIsActive(useNetworkConnector());
    }

    function useNetworkProvider(network?: Networkish) {
        return useSelectedProvider(useNetworkConnector(), network);
    }

    function useNetworkENSName(provider: CustomWeb3Provider | undefined) {
        return useSelectedENSName(useNetworkConnector(), provider);
    }

    function useNetworkWeb3React(provider: CustomWeb3Provider | undefined) {
        return useSelectedWeb3React(useNetworkConnector(), provider);
    }

    function useNetworkAnyENSName(
        provider: CustomWeb3Provider | 'nugg' | undefined,
        account: string,
    ) {
        return useSelectedAnyENSName(useNetworkConnector(), provider, account);
    }

    function useNetworkBalance(provider: CustomWeb3Provider | undefined) {
        return useSelectedBalance(useNetworkConnector(), provider);
    }

    function useNetworkPeer() {
        return useSelectedPeer(useNetworkConnector());
    }

    function useNetworkTx(hash: string) {
        return useSelectedTx(useNetworkConnector(), hash);
    }

    return {
        useNetworkConnector,
        useNetworkChainId,
        useNetworkAccounts,
        useNetworkIsActivating,
        useNetworkError,
        useNetworkAccount,
        useNetworkIsActive,
        useNetworkProvider,
        useNetworkENSName,
        useNetworkWeb3React,
        useNetworkAnyENSName,
        useNetworkBalance,
        useNetworkPeer,
        useNetworkTx,
    };
}

/**
 * Creates a variety of convenience `hooks` that return data associated with the first of the `initializedConnectors`
 * that is active.
 *
 * @param initializedConnectors - Two or more [connector, hooks] arrays, as returned from initializeConnector.
 * @returns hooks - A variety of convenience hooks that wrap the hooks returned from initializeConnector.
 */
export function getPriorityConnector(initializedConnectors: {
    [key in ConnectorEnum]?: ResWithStore<Connector>;
}) {
    const {
        useSelectedChainId,
        useSelectedAccounts,
        useSelectedIsActivating,
        useSelectedError,
        useSelectedAccount,
        useSelectedIsActive,
        useSelectedProvider,
        useSelectedENSName,
        useSelectedWeb3React,
        useSelectedAnyENSName,
        useSelectedBalance,
        useSelectedPeer,
        useSelectedTx,
        useSelectedCoreProvider,
        useSelectedTransactionManager,
    } = getSelectedConnector(...Object.values(initializedConnectors));

    function usePriorityConnector() {
        const manualPriority = client.live.manualPriority();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const values = Object.values(initializedConnectors).map((x) => x.hooks.useIsActive());
        const index = values.findIndex((x) => x);

        const check = manualPriority && initializedConnectors[manualPriority];

        if (check !== undefined) {
            return check.connector;
        }
        return Object.values(initializedConnectors)[index === -1 ? 0 : index].connector;
    }

    function usePriorityChainId() {
        return useSelectedChainId(usePriorityConnector());
    }

    function usePriorityAccounts() {
        return useSelectedAccounts(usePriorityConnector());
    }

    function usePriorityIsActivating() {
        return useSelectedIsActivating(usePriorityConnector());
    }

    function usePriorityError() {
        return useSelectedError(usePriorityConnector());
    }

    function usePriorityAccount() {
        return useSelectedAccount(usePriorityConnector());
    }

    function usePriorityIsActive() {
        return useSelectedIsActive(usePriorityConnector());
    }

    function usePriorityProvider(network?: Networkish) {
        return useSelectedProvider(usePriorityConnector(), network);
    }

    function usePriorityCoreProvider(network?: Networkish) {
        return useSelectedCoreProvider(usePriorityConnector(), network);
    }

    function usePriorityENSName(provider: CustomWeb3Provider | undefined) {
        return useSelectedENSName(usePriorityConnector(), provider);
    }

    function usePriorityWeb3React(provider: CustomWeb3Provider | undefined) {
        return useSelectedWeb3React(usePriorityConnector(), provider);
    }

    function usePriorityAnyENSName(
        provider: CustomWeb3Provider | 'nugg' | undefined,
        account: string,
    ) {
        return useSelectedAnyENSName(usePriorityConnector(), provider, account);
    }

    function usePriorityBalance(provider: CustomWeb3Provider | undefined) {
        return useSelectedBalance(usePriorityConnector(), provider);
    }

    function usePriorityPeer() {
        return useSelectedPeer(usePriorityConnector());
    }

    function usePriorityTx(hash: string) {
        return useSelectedTx(usePriorityConnector(), hash);
    }

    function usePriorityTransactionManager() {
        return useSelectedTransactionManager(usePriorityConnector());
    }

    return {
        usePriorityConnector,
        usePriorityChainId,
        usePriorityAccounts,
        usePriorityIsActivating,
        usePriorityError,
        usePriorityAccount,
        usePriorityIsActive,
        usePriorityProvider,
        usePriorityENSName,
        usePriorityWeb3React,
        usePriorityAnyENSName,
        useSelectedBalance,
        usePriorityBalance,
        usePriorityCoreProvider,
        usePriorityPeer,
        usePriorityTx,
        usePriorityTransactionManager,
    };
}

const CHAIN_ID = (state: Web3ReactState) => state.chainId;
const ACTIVE_PEER = (state: Web3ReactState) => state.peer;

const ACCOUNTS = (state: Web3ReactState) => state.accounts;
const ACCOUNTS_EQUALITY_CHECKER: EqualityChecker<Web3ReactState['accounts']> = (
    oldAccounts,
    newAccounts,
) =>
    (oldAccounts === undefined && newAccounts === undefined) ||
    (oldAccounts !== undefined &&
        oldAccounts.length === newAccounts?.length &&
        oldAccounts.every((oldAccount, i) => oldAccount === newAccounts[i]));
const ACTIVATING = (state: Web3ReactState) => state.activating;
const ERROR = (state: Web3ReactState) => state.error;

function getStateHooks(useConnector: UseBoundStore<StoreApi<Web3ReactState>>) {
    function useChainId(): Web3ReactState['chainId'] {
        return useConnector(CHAIN_ID);
    }

    function usePeer(): Web3ReactState['peer'] {
        return useConnector(ACTIVE_PEER);
    }

    function useAccounts(): Web3ReactState['accounts'] {
        return useConnector(ACCOUNTS, ACCOUNTS_EQUALITY_CHECKER);
    }

    function useIsActivating(): Web3ReactState['activating'] {
        return useConnector(ACTIVATING);
    }

    function useError(): Web3ReactState['error'] {
        return useConnector(ERROR);
    }

    return { useChainId, usePeer, useAccounts, useIsActivating, useError };
}

function getDerivedHooks({
    useChainId,
    useAccounts,
    useIsActivating,
    useError,
    usePeer,
}: ReturnType<typeof getStateHooks>) {
    function useAccount(): string | undefined {
        return useAccounts()?.[0];
    }

    function useIsActive(): boolean {
        const chainId = useChainId();
        const accounts = useAccounts();
        const activating = useIsActivating();
        const error = useError();
        const peer = usePeer();

        return computeIsActive({
            chainId,
            peer,
            accounts,
            activating,
            error,
        });
    }

    return { useAccount, useIsActive };
}

function useTx(provider: CustomWeb3Provider | undefined, hash: string) {
    const [data, setData] = useState<TransactionReceipt>();

    useEffect(() => {
        if (provider && hash) {
            let stale = false;

            provider
                .getTransactionReceipt(hash)
                .then((result) => {
                    if (!stale) {
                        setData(result);
                    }
                })
                .catch((error) => {
                    console.debug('Could not fetch Tx Data', error);
                });

            return () => {
                stale = true;
                setData(undefined);
            };
        }
        return () => undefined;
    }, [provider, hash]);
    return data;
}

function useTransactionManager(provider: CustomWeb3Provider | undefined) {
    const [receipt, setReceipt] = useState<TransactionReceipt>();
    const [response, setActiveResponse] = useState<TransactionResponse>();

    // const cancel = useCallback(() => {
    //     if (!receipt && provider && response) {
    //         void provider
    //             .getSigner()
    //             .provider.send('eth_sendTransaction', [
    //                 Address.ZERO.hash,
    //                 {
    //                     from: provider.getSigner()._address,
    //                     to: Address.ZERO.hash,
    //                     nonce: response.nonce,
    //                     gasPrice: response?.gasPrice?.add(1),
    //                 },
    //             ])
    //             .then((y) => {
    //                 // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    //                 console.log({ y });
    //             });
    //     }
    // }, [response, provider, receipt]);

    // const replace = useCallback(
    //     (gasPrice: BigNumber) => {
    //         if (!receipt && provider && response && populated) {
    //             void provider
    //                 .getSigner()
    //                 .sendTransaction({
    //                     ...populated,
    //                     nonce: response?.nonce,
    //                     gasPrice,
    //                 })
    //                 .then((x) => setActiveResponse(x));
    //         }
    //     },
    //     [provider, response, populated, receipt],
    // );

    const send = useCallback(
        (tx: PopulatedTransaction) => {
            if (!receipt && provider) {
                console.log({ tx });
                void provider
                    .getSigner()
                    .sendTransaction(tx)
                    .then((x) => {
                        console.log({ x });
                        setActiveResponse(x);
                    });
            }
        },
        [provider, receipt],
    );

    useEffect(() => {
        if (provider && response) {
            void provider.waitForTransaction(response.hash).then((result) => {
                setReceipt(result);
            });
        }
        return () => undefined;
    }, [provider, response]);

    return { response, receipt, send };
}

function useBalance(provider: CustomWeb3Provider | undefined, account: string | undefined) {
    const [balance, setBalance] = useState<EthInt>();
    useEffect(() => {
        if (provider && account) {
            let stale = false;
            setBalance(new EthInt(0));

            provider
                .getBalance(account as AddressString)
                .then((result) => {
                    if (!stale) {
                        setBalance(new EthInt(result));
                    }
                })
                .catch((error) => {
                    console.debug('Could not fetch ENS names', error);
                });

            return () => {
                stale = true;
                setBalance(new EthInt(0));
            };
        }
        return () => undefined;
    }, [provider, account]);
    return balance;
}

function useENS(
    provider: CustomWeb3Provider | 'nugg' | undefined,
    account: Lowercase<string> | undefined,
    chainId: Chain | undefined,
): (string | null) | undefined {
    // const [ENSName, setENSName] = useState<string | null | undefined>();
    // account ? Address.shortenAddressHash(account) : '',

    const persistedEns = client.ens.useEns(
        typeof provider === 'string' ? undefined : provider,
        account as AddressString,
    );

    if (!account || !provider || !chainId) return undefined;

    if (account === Address.ZERO.hash) return 'black-hole';
    if (provider === 'nugg') return account.toPrettyId();
    if (
        account.toLowerCase() === CONTRACTS[chainId].NuggftV1.toLowerCase() ||
        account.toLowerCase() === Address.ZERO.hash
    )
        return 'nuggftv1.nugg.xyz';
    return persistedEns;
}

function getAugmentedHooks<T extends Connector>(
    connector: T,
    { useChainId, useAccounts, useError }: ReturnType<typeof getStateHooks>,
    { useAccount, useIsActive }: ReturnType<typeof getDerivedHooks>,
) {
    function useProvider(network?: Networkish, enabled = true): CustomWeb3Provider | undefined {
        const isActive = useIsActive();

        const chainId = useChainId();
        const accounts = useAccounts();

        // trigger the dynamic import on mount
        const [providers, setProviders] = useState<
            { CustomWeb3Provider: typeof CustomWeb3Provider } | undefined
        >(undefined);
        useEffect(() => {
            import('@src/web3/classes/CustomWeb3Provider').then(setProviders).catch(() => {
                console.debug('@ethersproject/providers not available');
            });
        }, []);

        return useMemo(() => {
            // we use chainId and accounts to re-render in case connector.provider changes in place
            if (providers && enabled && isActive && chainId && accounts && connector.provider) {
                return new providers.CustomWeb3Provider(chainId, connector.provider, network);
            }
            return undefined;
        }, [providers, enabled, isActive, chainId, accounts, network]);
    }

    function useCoreProvider(network?: Networkish, enabled = true): CoreProvider | undefined {
        const isActive = useIsActive();

        const chainId = useChainId();
        const accounts = useAccounts();

        return useMemo(() => {
            // we use chainId and accounts to re-render in case connector.provider changes in place
            if (enabled && isActive && chainId && accounts && connector.provider) {
                return {
                    type: connector.connectorType,
                    provider: connector.provider,
                } as CoreProvider;
            }
            return undefined;
        }, [enabled, isActive, chainId, accounts]);
    }

    function useENSName(provider: CustomWeb3Provider | undefined): string | null | undefined {
        const account = useAccount();
        const chainId = useChainId();

        return useENS(provider, account, chainId);
    }

    function useAnyENSName(
        provider: CustomWeb3Provider | 'nugg' | undefined,
        account: string,
    ): (string | null) | undefined {
        const chainId = useChainId();

        return useENS(provider, account, chainId);
    }

    // for backwards compatibility only
    function useWeb3React(provider: CustomWeb3Provider | undefined) {
        const chainId = useChainId();
        const account = useAccount();
        const error = useError();

        const isActive = useIsActive();

        return useMemo(
            () => ({
                connector,
                library: provider,
                chainId,
                account,
                active: isActive,
                error,
            }),
            [provider, chainId, account, isActive, error],
        );
    }

    return { useProvider, useENSName, useWeb3React, useAnyENSName, useCoreProvider };
}
