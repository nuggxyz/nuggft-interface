import { PayloadAction } from '@reduxjs/toolkit';

import {
    isUndefinedOrNullOrNotFunction,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
    shortenTxnHash,
} from '@src/lib';
import AppState from '@src/state/app';
import { NLState } from '@src/state/NLState';
import { CHAIN_INFO } from '@src/web3/config';

import * as state from '..';

export const pending: NL.Redux.Middleware<
    Record<string, unknown>,
    NL.Redux.RootState,
    NL.Redux.Dispatch<any>
> =
    ({ getState }) =>
    (next) =>
    async (action: PayloadAction<NL.Redux.Transaction.PendingMiddlewareTx>) => {
        if (
            !isUndefinedOrNullOrObjectEmpty(action.payload) &&
            !isUndefinedOrNullOrStringEmpty(action.payload._pendingtx)
        ) {
            state.default.transaction.dispatch.addTransaction(action.payload._pendingtx);
            AppState.dispatch.addToastToList({
                duration: 0,
                title: 'Pending Transaction',
                message: shortenTxnHash(action.payload._pendingtx),
                error: false,
                id: action.payload._pendingtx,
                index: getState().app.toasts.length,
                loading: true,
                action: (setClose) => {
                    // setClose(true);
                    let win = window.open(
                        `${CHAIN_INFO[action.payload.chainId].explorer}tx/${
                            action.payload._pendingtx
                        }`,
                        '_blank',
                    );
                    win.focus();
                },
            });
            if (!isUndefinedOrNullOrNotFunction(action.payload.callbackFn)) {
                action.payload.callbackFn();
            }
        }
        // console.log(state);
        if (NLState.hasSuffix(action, 'finalizeTransaction')) {
            AppState.dispatch.replaceToast({
                //@ts-ignore
                id: action.payload.hash,
                //@ts-ignore
                duration: action.payload.successful ? 5000 : 0,
                loading: false,
                //@ts-ignore
                error: !action.payload.successful,
                //@ts-ignore
                title: action.payload.successful ? 'Successful Transaction' : 'Transaction Failed',
            });
        }
        return next(action);
    };

export default { pending };
