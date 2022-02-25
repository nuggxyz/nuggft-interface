import { AbstractConnector } from '@web3-react/abstract-connector';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UnsupportedChainIdError } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

import { isUndefinedOrNullOrObjectEmpty } from '../../lib';
import { NLState } from '../NLState';

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

    declare static select: ApplyFuncToChildren<typeof this.instance._initialState>;
    declare static dispatch: ApplyDispatchToChildren<typeof this.instance._slice.actions>;

    static get instance() {
        if (this._instance === undefined) this._instance = new this();
        return this._instance;
    }

    constructor() {
        super(STATE_NAME, updater, middlewares, {}, hooks, {
            web3address: undefined,
            web3error: false,
            connectivityWarning: false,
            implements3085: false,
            currentChain: Web3Config.DEFAULT_CHAIN,
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
            },
            setWeb3Error: (state, action: PayloadAction<boolean>) => {
                state.web3error = action.payload;
            },
            setCurrentChain: (state, action: PayloadAction<SupportedChainId>) => {
                state.currentChain = action.payload;
            },
        },
    });

    public static activate: (
        connector: AbstractConnector,
        onError?: (error: Error) => void,
        throwErrors?: boolean,
    ) => Promise<void>;

    public static safeActivate(
        activate: (
            connector: AbstractConnector,
            onError?: (error: Error) => void,
            throwErrors?: boolean,
        ) => Promise<void>,
    ) {
        return async (connector?: AbstractConnector) => {
            Web3State.dispatch.setWeb3Error(false);

            if (connector instanceof WalletConnectConnector) {
                connector.walletConnectProvider = undefined;
            }

            if (!isUndefinedOrNullOrObjectEmpty(connector)) {
                return await activate(connector, undefined, true).catch((error) => {
                    if (error instanceof UnsupportedChainIdError) {
                        activate(connector);
                    } else {
                        Web3State.dispatch.setWeb3Error(true);
                    }
                });
            }
        };
    }

    private static _library: Web3Provider;

    private static _networkLibrary: Web3Provider;

    public static resetLibraries() {
        Web3State._library = undefined;
        Web3State._networkLibrary = undefined;
    }

    // public static getProvider(provider?: any): Web3Provider {
    //     const currentChain = store.getState().web3.currentChain;
    //     let library: Web3Provider;
    //     if (isUndefinedOrNullOrObjectEmpty(provider)) {
    //         let networkProvider = Web3Config.connectors.network.provider;
    //         if (
    //             isUndefinedOrNullOrObjectEmpty(Web3State._networkLibrary) ||
    //             networkProvider.chainId !== currentChain
    //         ) {
    //             Web3State._networkLibrary = new Web3Provider(
    //                 networkProvider as any,
    //                 !isUndefinedOrNull(networkProvider.chainId) ? +networkProvider.chainId : 'any',
    //             );
    //         }
    //         library = Web3State._networkLibrary;
    //     } else {
    //         if (
    //             isUndefinedOrNullOrObjectEmpty(Web3State._library) ||
    //             provider.chainId !== currentChain
    //         ) {
    //             Web3State._library = new Web3Provider(
    //                 provider as any,
    //                 !isUndefinedOrNull(provider.chainId) ? +provider.chainId : 'any',
    //             );
    //         }
    //         library = Web3State._library;
    //     }
    //     library.pollingInterval = 1000;
    //     return library;
    // }

    public static _walletConnectSigner: any;

    // public static getSignerOrProvider(): Web3Provider | ethers.providers.JsonRpcSigner {
    //     if (isUndefinedOrNullOrStringEmpty(store.getState().web3.web3address)) {
    //         return this.getProvider();
    //     }
    //     if (!isUndefinedOrNullOrObjectEmpty(window.ethereum)) {
    //         return new ethers.providers.Web3Provider(window.ethereum).getSigner();
    //     } else {
    //         return new ethers.providers.Web3Provider(
    //             Web3Config.connectors.walletconnect.walletConnectProvider,
    //         ).getSigner();
    //     }
    // }
}
