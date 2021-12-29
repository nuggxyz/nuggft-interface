import { PayloadAction } from '@reduxjs/toolkit';

import {
    isUndefinedOrNullOrNotFunction,
    isUndefinedOrNullOrObjectEmpty,
    shortenTxnHash,
} from '../../lib';
import AppState from '../app';
import { NLState } from '../NLState';
import Web3Config from '../web3/Web3Config';

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
                action: () => {
                    let win = window.open(
                        `${
                            Web3Config.CHAIN_INFO[getState().web3.currentChain]
                                .explorer
                        }/tx/${action.payload._pendingtx.hash}`,
                        '_blank',
                    );
                    win.focus();
                },
            });
            if (!isUndefinedOrNullOrNotFunction(action.payload.callbackFn)) {
                action.payload.callbackFn();
            }
        }
        if (NLState.hasSuffix(action, 'finalizeTransaction')) {
            //@ts-ignore
            const successful = action.payload.receipt.status ? true : false;
            AppState.dispatch.replaceToast({
                //@ts-ignore
                id: action.payload.hash,
                duration: successful ? 5000 : 0,
                loading: false,
                error: !successful,
                title: successful
                    ? 'Successful Transaction'
                    : 'Transaction Failed',
            });
            // const tmp = action.payload._pendingtx
            //     ?.info as NL.Redux.Transaction.ERC721ApprovalInfo;
        }
        return next(action);
    };

export default { pending };
