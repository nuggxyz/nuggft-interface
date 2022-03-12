import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import WalletState from './wallet';
import AppState from './app';
import TransactionState from './transaction';
import NuggDexState from './nuggdex';

export const states = {
    app: AppState,
    transaction: TransactionState,
    wallet: WalletState,
    nuggdex: NuggDexState,
};

export const rootReducer = combineReducers({
    app: AppState.reducer,
    nuggdex: NuggDexState.reducer,
    transaction: TransactionState.reducer,
    wallet: WalletState.reducer,
});

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    'app/addToastToList',
                    'app/removeToastFromList',
                    'wallet/placeOffer/fulfilled',
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
