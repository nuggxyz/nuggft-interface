import { useCallback, useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';

import {
    isUndefinedOrNull,
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrBooleanFalse,
    isUndefinedOrNullOrNotFunction,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../lib';

import Web3Config from './Web3Config';
import { switchToNetwork } from './helpers';

import Web3State from '.';

export default () => {
    const { library, chainId, activate, error } =
        Web3State.hook.useActiveWeb3React();
    const {
        activate: defaultActivate,
        account: web3Account,
        deactivate,
    } = useWeb3React();
    const web3status = Web3State.select.web3status();
    const web3address = Web3State.select.web3address();
    const [hasBeenActivated, setHasBeenActivated] = useState(false);
    const [hasBeenSafeActivated, setHasBeenSafeActivated] = useState(false);
    const onDisconnect = useCallback(async () => {
        console.log('eth event: disconnect');
        Web3State.dispatch.clearWeb3Address();
    }, []);
    const onConnect = useCallback(async (connectInfo: { chainId: string }) => {
        console.log('eth event: connect', connectInfo);
        Web3State.dispatch.setCurrentChain(chainId);
    }, []);
    const onAccountsChanged = useCallback(async (accounts) => {
        console.log('eth event: accountsChanged', { accounts });
        if (!isUndefinedOrNullOrArrayEmpty(accounts)) {
            Web3State.dispatch.setWeb3Address(accounts[0]);
        } else {
            Web3State.dispatch.clearWeb3Address();
        }
    }, []);
    const onChainChanged = useCallback(async (chainId) => {
        console.log('eth event: chainChanged', { chainId });
        Web3State.dispatch.setCurrentChain(chainId);
    }, []);
    const onMessage = useCallback(
        async (message: { type: string; data: unknown }) => {
            console.log('eth event: message', { message });
        },
        [],
    );

    useEffect(() => {
        if (!isUndefinedOrNullOrNotFunction(defaultActivate)) {
            Web3State.activate = defaultActivate;
        }
        if (!isUndefinedOrNullOrNotFunction(deactivate)) {
            Web3State.deactivate = deactivate;
        }
    }, [defaultActivate, deactivate]);

    useEffect(() => {
        if (!isUndefinedOrNullOrObjectEmpty(error)) {
        Web3State.dispatch.setWeb3Status('ERROR');
        }
    }, [error]);

    useEffect(() => {
        if (!isUndefinedOrNullOrStringEmpty(web3address)) {
            if (!hasBeenSafeActivated) {
                Web3State.safeActivate(Web3Config.connectors.injected);
                Web3State.dispatch.setWeb3Status('SELECTED');
                setHasBeenSafeActivated(true);
            }
        } else if (!hasBeenActivated) {
            activate(Web3Config.connectors.network);
            Web3State.dispatch.setWeb3Status('NOT_SELECTED');
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
        switchToNetwork({ library })
            .then(
                (x) =>
                    !isUndefinedOrNull(x) ??
                    Web3State.dispatch.setImplements3085(true),
            )
            .catch(() => Web3State.dispatch.setImplements3085(true));
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
            isUndefinedOrNullOrObjectEmpty(web3address)
        ) {
            if (!isUndefinedOrNullOrObjectEmpty(window.ethereum)) {
                if (
                    !isUndefinedOrNullOrObjectEmpty(window.ethereum._state) &&
                    !isUndefinedOrNullOrArrayEmpty(
                        window.ethereum._state.accounts,
                    )
                ) {
                    Web3State.dispatch.setWeb3Address(
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
                    Web3State.dispatch.setWeb3Address(
                        window.ethereum.selectedProvider.selectedAddress,
                    );
                } else if (
                    !isUndefinedOrNullOrStringEmpty(
                        window.ethereum.selectedAddress,
                    )
                ) {
                    Web3State.dispatch.setWeb3Address(
                        window.ethereum.selectedAddress,
                    );
                } else if (!isUndefinedOrNullOrStringEmpty(web3Account)) {
                    Web3State.dispatch.setWeb3Address(web3Account);
                }
            } else if (!isUndefinedOrNullOrStringEmpty(web3Account)) {
                Web3State.dispatch.setWeb3Address(web3Account);
                Web3State.dispatch.setWeb3Status('SELECTED');
                Web3State._walletConnectSigner =
                    library?.getSigner(web3Account);
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
        library,
    ]);

    return null;
};
