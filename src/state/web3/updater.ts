import React, { useCallback, useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { BigNumber } from 'ethers';

import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrNotFunction,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../lib';

import Web3Config from './Web3Config';

import Web3State from '.';

export default () => {
    const { library, activate, error } = Web3State.hook.useActiveWeb3React();
    const {
        activate: defaultActivate,
        account: web3Account,
        deactivate,
    } = useWeb3React();
    const web3status = Web3State.select.web3status();
    const web3address = Web3State.select.web3address();
    const [hasBeenActivated, setHasBeenActivated] = useState(false);
    const [hasBeenSafeActivated, setHasBeenSafeActivated] = useState(false);

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
        if (!isUndefinedOrNullOrObjectEmpty(window.ethereum)) {
            window.ethereum.on('connect', (chainId) => {
                console.log('ss');
                console.log('eth event: connect', chainId);
                Web3State.dispatch.setCurrentChain(
                    BigNumber.from(chainId).toNumber(),
                );
            });
            window.ethereum.on('disconnect', () => {
                console.log('eth event: disconnect');
                Web3State.dispatch.clearWeb3Address();
            });
            window.ethereum.on('accountsChanged', (accounts) => {
                console.log('eth event: accountsChanged', { accounts });
                if (!isUndefinedOrNullOrArrayEmpty(accounts)) {
                    Web3State.dispatch.setWeb3Address(accounts[0]);
                } else {
                    Web3State.dispatch.clearWeb3Address();
                }
            });
            window.ethereum.on('chainChanged', (chainId) => {
                console.log('eth event: chainChanged', { chainId });
                Web3State.dispatch.setCurrentChain(
                    BigNumber.from(chainId).toNumber(),
                );
            });
            window.ethereum.on(
                'message',
                (message: { type: string; data: unknown }) => {
                    console.log('eth event: message', { message });
                },
            );
        }
        if (isUndefinedOrNullOrObjectEmpty(web3address)) {
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
    }, [web3status, web3address, web3Account, library]);

    return null;
};
