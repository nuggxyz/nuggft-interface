import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import WalletState from './wallet';
import AppState from './app';
import TransactionState from './transaction';
import ProtocolState from './protocol';
import TokenState from './token';
import SwapState from './swap';
import NuggDexState from './nuggdex';
import SocketState from './socket';

export const states = {
    AppState,
    SwapState,
    ProtocolState,
    TokenState,
    TransactionState,
    WalletState,
    NuggDexState,
    SocketState,
};

export const rootReducer = combineReducers({
    app: AppState.reducer,
    nuggdex: NuggDexState.reducer,
    protocol: ProtocolState.reducer,
    swap: SwapState.reducer,
    transaction: TransactionState.reducer,
    token: TokenState.reducer,
    wallet: WalletState.reducer,
    socket: SocketState.reducer,
});

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    'app/addToastToList',
                    'app/removeToastFromList',
                    'swap/placeOffer/fulfilled',
                    'wallet/claim/fulfilled',
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
