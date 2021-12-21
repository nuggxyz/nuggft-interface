import { PayloadAction } from '@reduxjs/toolkit';

import {
    isUndefinedOrNullOrNotFunction,
    isUndefinedOrNullOrObjectEmpty,
    shortenTxnHash,
} from '../../lib';
import AppState from '../app';
import { NLState } from '../NLState';

import TransactionState from '.';

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
            !isUndefinedOrNullOrObjectEmpty(action.payload._pendingtx)
        ) {
            TransactionState.dispatch.addTransaction({
                hash: action.payload._pendingtx.hash,
                from: action.payload._pendingtx.from,
                info: action.payload._pendingtx.info,
            });
            AppState.dispatch.addToastToList({
                duration: 0,
                title: 'Pending Transaction',
                message: shortenTxnHash(action.payload._pendingtx.hash),
                error: false,
                id: action.payload._pendingtx.hash,
                index: getState().app.toasts.length,
                loading: true,
            });
            if (!isUndefinedOrNullOrNotFunction(action.payload.callbackFn)) {
                action.payload.callbackFn();
            }
        }
        if (NLState.hasSuffix(action, 'finalizeTransaction')) {
            AppState.dispatch.replaceToast({
                //@ts-ignore
                id: action.payload.hash,
                duration: 5000,
                loading: false,
                title: 'Successful Transaction',
            });
            // const tmp = action.payload._pendingtx
            //     ?.info as NL.Redux.Transaction.ERC721ApprovalInfo;
        }
        return next(action);
    };

export default { pending };
