export {};
// export const states = {
//     app: AppState,
// };

// export const rootReducer = combineReducers({
//     app: AppState.reducer,
// });

// const store = configureStore({
//     reducer: rootReducer,
//     middleware: (getDefaultMiddleware) =>
//         getDefaultMiddleware({
//             serializableCheck: {
//                 ignoredActions: [
//                     'app/addToastToList',
//                     'app/removeToastFromList',
//                     'app/setModalOpen',
//                     'app/removeToastFromList',
//                     'wallet/placeOffer/fulfilled',
//                     'wallet/claim/fulfilled',
//                     'wallet/initLoan/fulfilled',
//                 ],
//                 ignoredPaths: ['app'],
//             },
//         }).concat(Object.values(states).flatMap((state) => state.middlewares)),
// });

// export type NLRootState = ReturnType<typeof rootReducer>;
// export type NLDispatch = typeof store.dispatch;

// export const useNLDispatch = () => useDispatch<NLDispatch>();
// export const NLSelector = (state: NLRootState) => state;

// export default store;
