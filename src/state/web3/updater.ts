import { useCallback, useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';

import {
    gatsbyDOM,
    isUndefinedOrNull,
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrBooleanFalse,
    isUndefinedOrNullOrNotFunction,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../lib';

import Web3Config from './config';
import Web3Helpers from './helpers';
import Web3Hooks from './hooks';
import Web3Dispatches from './dispatches';
import Web3Selectors from './selectors';

const Web3Updater = () => {
    const onReduxChainChange = Web3Selectors.currentChain();

    const { library, chainId, activate, error } =
        Web3Hooks.useActiveWeb3React();
    const {
        activate: defaultActivate,
        account: web3Account,
        deactivate,
    } = useWeb3React();
    const web3status = Web3Selectors.web3status();
    const web3address = Web3Selectors.web3address();
    const [hasBeenActivated, setHasBeenActivated] = useState(false);
    const [hasBeenSafeActivated, setHasBeenSafeActivated] = useState(false);
    const onDisconnect = useCallback(async () => {
        console.log('eth event: disconnect');
        Web3Dispatches.clearWeb3Address();
    }, []);
    const onConnect = useCallback(async (connectInfo: { chainId: string }) => {
        console.log('eth event: connect', connectInfo);
        Web3Dispatches.setCurrentChain(chainId);
    }, []);
    const onAccountsChanged = useCallback(async (accounts) => {
        console.log('eth event: accountsChanged', { accounts });
        if (!isUndefinedOrNullOrArrayEmpty(accounts)) {
            Web3Dispatches.setWeb3Address(accounts[0]);
        } else {
            Web3Dispatches.clearWeb3Address();
        }
    }, []);
    const onChainChanged = useCallback(async (chainId) => {
        console.log('eth event: chainChanged', { chainId });
        Web3Dispatches.setCurrentChain(chainId);
    }, []);
    const onMessage = useCallback(
        async (message: { type: string; data: unknown }) => {
            console.log('eth event: message', { message });
        },
        [],
    );
    useEffect(() => {
        if (!isUndefinedOrNullOrNotFunction(defaultActivate)) {
            Web3Helpers.activate = defaultActivate;
        }
        if (!isUndefinedOrNullOrNotFunction(deactivate)) {
            Web3Helpers.deactivate = deactivate;
        }
    }, [defaultActivate, deactivate]);

    useEffect(() => {
        if (!isUndefinedOrNullOrObjectEmpty(error)) {
            Web3Dispatches.setWeb3Status('ERROR');
        }
    }, [error]);

    useEffect(() => {
        if (!isUndefinedOrNullOrStringEmpty(web3address)) {
            if (!hasBeenSafeActivated) {
                Web3Helpers.safeActivate(Web3Config.connectors.injected);
                Web3Dispatches.setWeb3Status('SELECTED');
                setHasBeenSafeActivated(true);
            }
        } else if (!hasBeenActivated) {
            activate(Web3Config.connectors.network);
            Web3Dispatches.setWeb3Status('NOT_SELECTED');
            setHasBeenActivated(true);
        }
    }, [
        web3address,
        hasBeenActivated,
        activate,
        hasBeenSafeActivated,
        web3Account,
    ]);

    useEffect(() => {
        if (
            !web3Account ||
            !library?.provider?.request ||
            !library?.provider?.isMetaMask
        ) {
            return;
        }
        Web3Helpers.switchToNetwork({ library })
            .then(
                (x) =>
                    !isUndefinedOrNull(x) ??
                    Web3Dispatches.setImplements3085(true),
            )
            .catch(() => Web3Dispatches.setImplements3085(true));
    }, [web3Account, chainId, library]);

    useEffect(() => {
        if (!isUndefinedOrNullOrObjectEmpty(window.ethereum)) {
            window.ethereum.on('connect', onConnect);
            window.ethereum.on('disconnect', onDisconnect);
            window.ethereum.on('accountsChanged', onAccountsChanged);
            window.ethereum.on('chainChanged', onChainChanged);
            window.ethereum.on('message', onMessage);
        }
        if (
            isUndefinedOrNullOrBooleanFalse(web3status === 'SELECTED') &&
            isUndefinedOrNullOrStringEmpty(web3address) &&
            !isUndefinedOrNullOrObjectEmpty(window.ethereum)
        ) {
            console.log(window.ethereum.selectedAddress);
            if (
                !isUndefinedOrNullOrObjectEmpty(window.ethereum._state) &&
                !isUndefinedOrNullOrArrayEmpty(window.ethereum._state.accounts)
            ) {
                console.log('1');
                Web3Dispatches.setWeb3Address(
                    window.ethereum._state.accounts[0],
                );
            } else if (
                !isUndefinedOrNullOrObjectEmpty(
                    window.ethereum.selectedProvider,
                ) &&
                !isUndefinedOrNullOrStringEmpty(
                    window.ethereum.selectedProvider.selectedAddress,
                )
            ) {
                console.log(2);
                Web3Dispatches.setWeb3Address(
                    window.ethereum.selectedProvider.selectedAddress,
                );
            } else if (
                !isUndefinedOrNullOrStringEmpty(window.ethereum.selectedAddress)
            ) {
                console.log(3);
                Web3Dispatches.setWeb3Address(window.ethereum.selectedAddress);
            } else if (!isUndefinedOrNullOrStringEmpty(web3Account)) {
                console.log(4);
                Web3Dispatches.setWeb3Address(web3Account);
            }
        }
    }, [
        web3status,
        web3address,
        web3Account,
        onConnect,
        onDisconnect,
        onAccountsChanged,
        onChainChanged,
        onMessage,
        onReduxChainChange,
    ]);

    return null;
};

export default Web3Updater;
