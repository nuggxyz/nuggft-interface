import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import AppState from './app';
import TransactionSlice from './transaction';
import ProtocolState from './protocol';
import TokenSlice from './token';
import SwapSlice from './swap';
import NuggDexState from './nuggdex';
import Web3Slice from './web3';
import Web3Middlewares from './web3/middlewares';
import WalletSlice from './wallet';
import WalletMiddlewares from './wallet/middlewares';
import TransactionMiddlewares from './transaction/middlewares';
import TokenMiddlewares from './token/middlewares';
import SwapMiddlewares from './swap/middlewares';

export const states = {
    AppState,
    ProtocolState,
    NuggDexState,
};

export const rootReducer = combineReducers({
    app: AppState.reducer,
    nuggdex: NuggDexState.reducer,
    protocol: ProtocolState.reducer,
    swap: SwapSlice.reducer,
    transaction: TransactionSlice.reducer,
    token: TokenSlice.reducer,
    wallet: WalletSlice.reducer,
    web3: Web3Slice.reducer,
});

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: [
                    'time/timeSetTimeRemaining',
                    'epoch/expochSetBlock',
                    'xnugg/getCurrentStakeState/fulfilled',
                    'xnugg/getCurrentStakePosition/fulfilled',
                    'swap/getCurrentSwap/fulfilled',
                    'epoch/getPendingToken/fulfilled',
                    'swap/getCurrentSwap/pending',
                ],
                // Ignore these field paths in all actions
                ignoredActionPaths: [
                    'payload.xnugg',
                    'xnugg.stakePosition',
                    'xnugg.stakePosition.shares',
                    'swap',
                    'meta',
                    'xnugg',
                    'meta.arg.amount',
                    'payload',
                ],
                // Ignore these paths in the state
                ignoredPaths: [
                    'token',
                    'meta',
                    'payload',
                    'transaction',
                    'subgraph',
                    'web3',
                    'wallet',
                    'swap',
                    'nuggdex',
                ],
            },
        })
            .concat(Object.values(states).flatMap((state) => state.middlewares))
            .concat([
                ...Object.values(Web3Middlewares),
                ...Object.values(WalletMiddlewares),
                ...Object.values(TransactionMiddlewares),
                ...Object.values(TokenMiddlewares),
                ...Object.values(SwapMiddlewares),
            ]),
});

export type NLRootState = ReturnType<typeof rootReducer>;
export type NLDispatch = typeof store.dispatch;

export const useNLDispatch = () => useDispatch<NLDispatch>();
export const NLSelector = (state: NLRootState) => state;

export default store;
