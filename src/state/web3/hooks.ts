import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { BigNumber } from 'ethers';
import { DependencyList, useCallback, useEffect, useState } from 'react';
import { batch } from 'react-redux';

import { Address, EnsAddress } from '../../classes/Address';
import { NetworkContextName } from '../../config';
import NuggftV1Helper from '../../contracts/NuggftV1Helper';
import GQLHelper from '../../graphql/GQLHelper';
import {
    isUndefinedOrNull,
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrBooleanFalse,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
    loadFromLocalStorage,
    loadStringFromLocalStorage,
    saveStringToLocalStorage,
    saveToLocalStorage,
} from '../../lib';
import NuggDexState from '../nuggdex';
import ProtocolState from '../protocol';
import store from '../store';
import SwapState from '../swap';
import TokenState from '../token';
import TransactionState from '../transaction';
import WalletState from '../wallet';

import Web3Config from './Web3Config';

import Web3State from '.';

const useActiveWeb3React = () => {
    const context = useWeb3React<Web3Provider>();
    const contextNetwork = useWeb3React<Web3Provider>(NetworkContextName);
    return context.active ? context : contextNetwork;
};

/**
 * Given a name or address, does a lookup to resolve to an address and name
 * @param nameOrAddress ENS name or address
 */
const useEns = (address: string, deps: DependencyList = []): string => {
    const [addr, setAddr] = useState('');

    const getData = useCallback(async (address) => {
        if (address) {
            if (
                address === Web3Config.activeChain__NuggftV1 ||
                address === Address.ZERO.hash
            ) {
                setAddr('NuggftV1');
            } else {
                let storage = {};
                if (address === store.getState().web3.web3address) {
                    storage = loadFromLocalStorage('ens', false) || {};
                }
                const ensAddress = new EnsAddress(address);
                if (!isUndefinedOrNullOrObjectEmpty(storage)) {
                    setAddr(storage[store.getState().web3.currentChain]);
                } else {
                    setAddr(Address.shortenAddress(ensAddress));
                }
                await ensAddress.ensureEns();
                setAddr(ensAddress.short);
                if (address === store.getState().web3.web3address) {
                    storage[store.getState().web3.currentChain] =
                        ensAddress.short;
                    saveToLocalStorage(storage, 'ens', false);
                }
            }
        } else {
            setAddr(undefined);
        }
    }, deps);

    useEffect(() => {
        getData(address);
    }, [getData, address]);

    return addr;
};

const useWeb3Listeners = () => {
    const { library, chainId: connectorChainId } = useWeb3React();
    const chainId = Web3State.select.currentChain();

    const resetState = useCallback((chainId: number | string) => {
        if (!isUndefinedOrNull(chainId)) {
            console.log('RESET');
            Web3State.dispatch.setCurrentChain(
                BigNumber.from(chainId).toNumber(),
            );
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
    }, []);

    useEffect(() => {
        console.log({ connectorChainId, chainId });
        if (connectorChainId) {
            connectorChainId !== chainId && resetState(connectorChainId);
        }
    }, [connectorChainId, chainId, resetState]);

    useEffect(() => {
        if (!isUndefinedOrNullOrObjectEmpty(window.ethereum)) {
            const connect = (chain) => {
                console.log('eth event: connect', chain);
                resetState(chain.chainId);
            };
            const disconnect = () => {
                console.log('eth event: disconnect');
                Web3State.dispatch.clearWeb3Address();
                resetState(Web3Config.DEFAULT_CHAIN);
            };
            const accountsChanged = (accounts) => {
                console.log('eth event: accountsChanged', { accounts });
                if (!isUndefinedOrNullOrArrayEmpty(accounts)) {
                    Web3State.dispatch.setWeb3Address(accounts[0]);
                } else {
                    Web3State.dispatch.clearWeb3Address();
                    resetState(Web3Config.DEFAULT_CHAIN);
                }
            };
            const chainChanged = (chainId) => {
                console.log('eth event: chainChanged', chainId);
                resetState(chainId);
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
    }, [chainId, library, resetState]);
};

const useSetWeb3Account = () => {
    const web3address = Web3State.select.web3address();
    const {
        activate: defaultActivate,
        account: web3Account,
        active,
        library,
    } = useWeb3React();

    useEffect(() => {
        if (isUndefinedOrNullOrStringEmpty(web3address)) {
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
                Web3State._walletConnectSigner =
                    library?.getSigner(web3Account);
            }
        }
    }, [web3address, web3Account, library]);
};

export default {
    useActiveWeb3React,
    useEns,
    useWeb3Listeners,
    useSetWeb3Account,
};
