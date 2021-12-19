import { combineReducers, configureStore, Middleware } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import reducerRegistry from './ReducerRegistry';
// import wallets from './wallet/middlewares';
// import apps from './app/middlewares';
// import transactions from './transaction/middlewares';
// import protocols from './protocol/middlewares';
// import tokens from './token/middlewares';
// import web3s from './web3/middlewares';
// import swaps from './swap/middlewares';
// import nuggdexes from './nuggdex/middlewares';

// const middlewares = [
//     wallets,
//     apps,
//     transactions,
//     protocols,
//     tokens,
//     web3s,
//     swaps,
//     nuggdexes,
// ].flatMap((middle) => Object.values(middle));

// import WalletState from './wallet';
// import AppState from './app';
// import TransactionState from './transaction';
// import ProtocolState from './protocol';
// import TokenState from './token';
// import Web3State from './web3';
// import SwapState from './swap';
// import NuggDexState from './nuggdex';

// export const states = {
//     AppState,
//     SwapState,
//     ProtocolState,
//     TokenState,
//     TransactionState,
//     WalletState,
//     Web3State,
//     NuggDexState,
// };

// export const rootReducer = combineReducers({
//     app: AppState.reducer,
//     nuggdex: NuggDexState.reducer,
//     protocol: ProtocolState.reducer,
//     swap: SwapState.reducer,
//     transaction: TransactionState.reducer,
//     token: TokenState.reducer,
//     wallet: WalletState.reducer,
//     web3: Web3State.reducer,
// });

// const combine = (reducers) => {
//     return combineReducers(reducers);
// };

const dynamicMiddleware: Middleware = (store) => (next) => (action) => {
    let middlewares = [...reducerRegistry.getMiddlewares()];
    const nextMiddleware = (remaining: any[]) => (action: any) => {
        remaining.length
            ? remaining[0](store)(nextMiddleware(remaining.slice(1)))(action)
            : next(action);
    };

    nextMiddleware(middlewares)(action);
};

const store = configureStore({
    reducer: combineReducers(reducerRegistry.getReducers()), //rootReducer,
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
        }).concat(dynamicMiddleware), //.concat(middlewares as any), //.concat(Object.values(states).flatMap((state) => state.middlewares)),
});

reducerRegistry.setChangeListener((reducers) => {
    store.replaceReducer(combineReducers(reducers));
});

export type NLRootState = any; //ReturnType<typeof rootReducer>;
export type NLDispatch = typeof store.dispatch;

export const useNLDispatch = () => useDispatch<NLDispatch>();
export const NLSelector = (state: NLRootState) => state;

export default store;
