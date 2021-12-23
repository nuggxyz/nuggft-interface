import { AbstractConnector } from '@web3-react/abstract-connector';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UnsupportedChainIdError } from '@web3-react/core';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

import {
    isUndefinedOrNull,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../lib';
import { NLState } from '../NLState';
import { Address } from '../../classes/Address';
import store from '../store';

import middlewares from './middlewares';
import updater from './updater';
import Web3Config, { SupportedChainId } from './Web3Config';
import hooks from './hooks';

const STATE_NAME = 'web3';

export default class Web3State extends NLState<NL.Redux.Web3.State> {
    declare static _instance: Web3State;

    declare static actions: typeof this.instance._slice.actions;
    declare static reducer: typeof this.instance._slice.reducer;
    declare static hook: typeof hooks;

    declare static select: ApplyFuncToChildren<
        typeof this.instance._initialState
    >;
    declare static dispatch: ApplyDispatchToChildren<
        typeof this.instance._slice.actions
    >;

    static get instance() {
        if (this._instance === undefined) this._instance = new this();
        return this._instance;
    }

    constructor() {
        super(STATE_NAME, updater, middlewares, {}, hooks, {
            web3address: undefined,
            web3status: 'NOT_SELECTED',
            web3error: false,
            connectivityWarning: false,
            implements3085: false,
            currentChain: 1,
        });
    }

    protected override _slice = createSlice({
        name: this._name,
        initialState: this._initialState,
        reducers: {
            setImplements3085: (state, action: PayloadAction<boolean>) => {
                state.implements3085 = action.payload;
            },
            setConnectivityWarning: (state, action: PayloadAction<boolean>) => {
                state.connectivityWarning = action.payload;
            },
            setWeb3Address: (state, action: PayloadAction<string>) => {
                state.web3address = action.payload.toLowerCase();
            },
            clearWeb3Address: (state) => {
                state.web3address = undefined;
                state.web3status = 'NOT_SELECTED';
            },
            setWeb3Status: (
                state,
                action: PayloadAction<NL.Redux.Web3.Web3Status>,
            ) => {
                state.web3status = action.payload;
            },
            clearWeb3Status: (state) => {
                state.web3status = 'NOT_SELECTED';
            },
            setWeb3Error: (state, action: PayloadAction<boolean>) => {
                state.web3error = action.payload;
            },
            setCurrentChain: (
                state,
                action: PayloadAction<SupportedChainId>,
            ) => {
                state.currentChain = action.payload;
            },
        },
    });

    public static deactivate: () => void;

    public static activate: (
        connector: AbstractConnector,
        onError?: (error: Error) => void,
        throwErrors?: boolean,
    ) => Promise<void>;

    public static safeActivate(connector?: AbstractConnector) {
        Web3State.dispatch.setWeb3Status('PENDING');
        Web3State.dispatch.setWeb3Error(false);

        if (connector instanceof WalletConnectConnector) {
            connector.walletConnectProvider = undefined;
        }

        if (!isUndefinedOrNullOrObjectEmpty(connector)) {
            Web3State.activate(connector, undefined, true)
                .then(async () => {
                    Web3State.dispatch.setWeb3Status('SELECTED');
                })
                .catch((error) => {
                    if (error instanceof UnsupportedChainIdError) {
                        Web3State.activate(connector);
                        Web3State.dispatch.setWeb3Status('SELECTED');
                    } else {
                        Web3State.dispatch.setWeb3Error(true);
                        Web3State.dispatch.setWeb3Status('NOT_SELECTED');
                    }
                });
        } else {
            Web3State.dispatch.setWeb3Status('NOT_SELECTED');
        }
    }

    private static _library: Web3Provider;

    private static _networkLibrary: Web3Provider;

    public static getLibrary(provider?: any): Web3Provider {
        let library: Web3Provider;
        if (isUndefinedOrNullOrObjectEmpty(provider)) {
            if (isUndefinedOrNullOrObjectEmpty(Web3State._networkLibrary)) {
                let networkProvider = Web3Config.connectors.network.provider;
                Web3State._networkLibrary = new Web3Provider(
                    networkProvider as any,
                    !isUndefinedOrNull(networkProvider.chainId)
                        ? +networkProvider.chainId
                        : 'any',
                );
            }
            library = Web3State._networkLibrary;
        } else {
            if (isUndefinedOrNullOrObjectEmpty(Web3State._library)) {
                Web3State._library = new Web3Provider(
                    provider as any,
                    !isUndefinedOrNull(provider.chainId)
                        ? +provider.chainId
                        : 'any',
                );
            }
            library = Web3State._library;
        }
        library.pollingInterval = 1000;
        return library;
    }

    public static _walletConnectSigner: any;

    public static getLibraryOrProvider():
        | Web3Provider
        | ethers.providers.JsonRpcSigner {
        return isUndefinedOrNullOrStringEmpty(store.getState().web3.web3address)
            ? this.getLibrary()
            : window.ethereum
            ? new ethers.providers.Web3Provider(window.ethereum).getSigner()
            : new ethers.providers.Web3Provider(
                  Web3Config.connectors.walletconnect.walletConnectProvider,
              ).getSigner();
    }

    // account is not optional
    public static getSigner(account: Address): JsonRpcSigner {
        return this.getLibrary().getSigner(account.hash).connectUnchecked();
    }

    // account is optional
    public static getProviderOrSigner(
        library: Web3Provider,
        account?: Address,
    ): Web3Provider | JsonRpcSigner {
        return account ? this.getSigner(account) : library;
    }
}
