import { BigNumber } from 'ethers';
import { useEffect } from 'react';
import { batch } from 'react-redux';

import NuggftV1Helper from '../contracts/NuggftV1Helper';
import GQLHelper from '../graphql/GQLHelper';
import {
    isUndefinedOrNull,
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
    loadStringFromLocalStorage,
    saveStringToLocalStorage,
} from '../lib';
import NuggDexState from '../state/nuggdex';
import ProtocolState from '../state/protocol';
import SwapState from '../state/swap';
import TokenState from '../state/token';
import TransactionState from '../state/transaction';
import WalletState from '../state/wallet';
import Web3State from '../state/web3';
import Web3Config from '../state/web3/Web3Config';

const RESET_APP = (chainId: number | string) => {
    if (!isUndefinedOrNull(chainId)) {
        console.log('RESET');
        Web3State.dispatch.setCurrentChain(BigNumber.from(chainId).toNumber());
        const walletconnect = loadStringFromLocalStorage('walletconnect');
        localStorage.clear();
        if (!isUndefinedOrNullOrStringEmpty(walletconnect)) {
            saveStringToLocalStorage(walletconnect, 'walletconnect');
        }
        NuggftV1Helper.reset();
        GQLHelper.reset();
        batch(() => {
            NuggDexState.dispatch.reset();
            ProtocolState.dispatch.reset();
            SwapState.dispatch.reset();
            TokenState.dispatch.reset();
            TransactionState.dispatch.reset();
            WalletState.dispatch.reset();
        });
    }
};

const useSetWeb3Listeners = ({
    chainId,
    library,
    activateNetwork,
    connectorChainId,
}) => {
    useEffect(() => {
        console.log({ connectorChainId, chainId });
        if (connectorChainId) {
            connectorChainId !== chainId && RESET_APP(connectorChainId);
        }
    }, [connectorChainId, chainId]);

    useEffect(() => {
        if (!isUndefinedOrNullOrObjectEmpty(window.ethereum)) {
            const connect = (chain) => {
                console.log('eth event: connect', chain);
                // RESET_APP(chain.chainId);
            };
            const disconnect = () => {
                console.log('eth event: disconnect');
                Web3State.dispatch.clearWeb3Address();
                RESET_APP(Web3Config.DEFAULT_CHAIN);
            };
            const accountsChanged = (accounts) => {
                console.log('eth event: accountsChanged', { accounts });
                if (!isUndefinedOrNullOrArrayEmpty(accounts)) {
                    Web3State.dispatch.setWeb3Address(accounts[0]);
                } else {
                    Web3State.dispatch.clearWeb3Address();
                    RESET_APP(Web3Config.DEFAULT_CHAIN);
                }
            };
            const chainChanged = (chainId) => {
                console.log('eth event: chainChanged', chainId);
                // RESET_APP(chainId);
            };
            const message = (message: { type: string; data: unknown }) => {
                console.log('eth event: message', { message });
            };

            window.ethereum.on('connect', connect);
            window.ethereum.on('disconnect', disconnect);
            window.ethereum.on('accountsChanged', accountsChanged);
            window.ethereum.on('chainChanged', chainChanged);
            window.ethereum.on('message', message);

            return () => {
                window.ethereum.removeListener('connect', connect);
                window.ethereum.removeListener('disconnect', disconnect);
                window.ethereum.removeListener(
                    'accountChanged',
                    accountsChanged,
                );
                window.ethereum.removeListener('chainChanged', chainChanged);
                window.ethereum.removeListener('message', message);
            };
        }
    }, [chainId, library, activateNetwork]);
};

export default useSetWeb3Listeners;
