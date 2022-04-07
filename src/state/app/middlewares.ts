// eslint-disable-next-line import/no-cycle

// import { NLRootState } from '@src/state/store';

// eslint-disable-next-line import/no-cycle
export default {};
// interface PendingMiddlewareTx {
//     _pendingtx: string;
//     callbackFn?: (b: (a: TransactionReceipt) => void) => void;
//     chainId: import('./../../web3/core/interfaces').Chain;
// }

// export const pending: NL.Redux.Middleware<
//     Record<string, unknown>,
//     NL.Redux.RootState,
//     NL.Redux.Dispatch<unknown>
// > =
//     ({ getState }) =>
//     (next) =>
//     (action: PayloadAction<PendingMiddlewareTx>) => {
//         if (
//             !isUndefinedOrNullOrObjectEmpty(action.payload) &&
//             !isUndefinedOrNullOrStringEmpty(action.payload._pendingtx)
//         ) {
//             AppState.dispatch.addToastToList({
//                 duration: 0,
//                 title: 'Pending Transaction',
//                 message: shortenTxnHash(action.payload._pendingtx),
//                 error: false,
//                 id: action.payload._pendingtx,
//                 // index: getState().app.toasts.length,
//                 loading: true,
//                 action: () => {
//                     const win = window.open(
//                         `${CHAIN_INFO[action.payload.chainId].explorer}tx/${
//                             action.payload._pendingtx
//                         }`,
//                         '_blank',
//                     );
//                     if (win) win.focus();
//                 },
//             });
//         }
//         if (NLState.hasSuffix(action, 'finalizeTransaction')) {
//             AppState.dispatch.replaceToast({
//                 // @ts-ignore
//                 // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//                 id: action.payload.hash,
//                 // @ts-ignore
//                 duration: action.payload.successful ? 5000 : 0,
//                 loading: false,
//                 // @ts-ignore
//                 error: !action.payload.successful,
//                 // @ts-ignore
//                 title: action.payload.successful
//                     ? t`Successful Transaction`
//                     : t`Transaction Failed`,
//             });
//         }
//         return next(action);
//     };

// const rejectedThactions: Middleware<Record<string, never>, NLRootState, Dispatch<any>> =
//     ({ getState }) =>
//     (next) =>
//     (action: PayloadAction<string>) => {
//         if (NLState.isRejected(action) && action.payload !== 'GAS_ERROR') {
//             const toasts = getState().app.toasts.length;
//             AppState.dispatch.addToastToList({
//                 index: toasts + 1,
//                 id: `${toasts + 1}`,
//                 duration: 0,
//                 error: true,
//                 loading: false,
//                 message: action.type,
//                 title: 'Error',
//             });
//         }

//         return next(action);
//     };

// export default {
//     // localStorager,
//     pending,
//     rejectedThactions,
//     // logger
// };
