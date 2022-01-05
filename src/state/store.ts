import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import WalletState from './wallet';
import AppState from './app';
import TransactionState from './transaction';
import ProtocolState from './protocol';
import TokenState from './token';
import Web3State from './web3';
import SwapState from './swap';
import NuggDexState from './nuggdex';

export const states = {
    AppState,
    SwapState,
    ProtocolState,
    TokenState,
    TransactionState,
    WalletState,
    Web3State,
    NuggDexState,
};

export const rootReducer = combineReducers({
    app: AppState.reducer,
    nuggdex: NuggDexState.reducer,
    protocol: ProtocolState.reducer,
    swap: SwapState.reducer,
    transaction: TransactionState.reducer,
    token: TokenState.reducer,
    wallet: WalletState.reducer,
    web3: Web3State.reducer,
});

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    'app/addToastToList',
                    'app/removeToastFromList',
                ],
                ignoredPaths: ['app'],
            },
        }).concat(Object.values(states).flatMap((state) => state.middlewares)),
});

export type NLRootState = ReturnType<typeof rootReducer>;
export type NLDispatch = typeof store.dispatch;

export const useNLDispatch = () => useDispatch<NLDispatch>();
export const NLSelector = (state: NLRootState) => state;

export default store;
