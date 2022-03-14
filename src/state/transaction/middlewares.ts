import { PayloadAction } from '@reduxjs/toolkit';

import client from '@src/client';
import emitter from '@src/emitter';
import {
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
    shortenTxnHash,
} from '@src/lib';
import AppState from '@src/state/app';
import { NLState } from '@src/state/NLState';
import { CHAIN_INFO } from '@src/web3/config';

// eslint-disable-next-line import/no-cycle
import TransactionState from './index';

export const pending: NL.Redux.Middleware<
    Record<string, unknown>,
    NL.Redux.RootState,
    NL.Redux.Dispatch<unknown>
> =
    ({ getState }) =>
    (next) =>
    (action: PayloadAction<PendingMiddlewareTx>) => {
        if (
            !isUndefinedOrNullOrObjectEmpty(action.payload) &&
            !isUndefinedOrNullOrStringEmpty(action.payload._pendingtx)
        ) {
            TransactionState.dispatch.addTransaction(action.payload._pendingtx);

            const check = client.static.infura();

            if (check) {
                void check.waitForTransaction(action.payload._pendingtx, 1, 600000).then((x) => {
                    TransactionState.dispatch.finalizeTransaction({
                        hash: x.transactionHash,
                        successful: x.status === 1,
                    });
                    emitter.emit({
                        type: emitter.events.TransactionComplete,
                        txhash: x.transactionHash,
                    });
                });
            }
            AppState.dispatch.addToastToList({
                duration: 0,
                title: 'Pending Transaction',
                message: shortenTxnHash(action.payload._pendingtx),
                error: false,
                id: action.payload._pendingtx,
                index: getState().app.toasts.length,
                loading: true,
                action: () => {
                    const win = window.open(
                        `${CHAIN_INFO[action.payload.chainId].explorer}tx/${
                            action.payload._pendingtx
                        }`,
                        '_blank',
                    );
                    if (win) win.focus();
                },
            });
            if (action.payload.callbackFn !== undefined) {
                action.payload.callbackFn();
            }
        }
        // console.log(state);
        if (NLState.hasSuffix(action, 'finalizeTransaction')) {
            AppState.dispatch.replaceToast({
                // @ts-ignore
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                id: action.payload.hash,
                // @ts-ignore
                duration: action.payload.successful ? 5000 : 0,
                loading: false,
                // @ts-ignore
                error: !action.payload.successful,
                // @ts-ignore
                title: action.payload.successful ? 'Successful Transaction' : 'Transaction Failed',
            });
        }
        return next(action);
    };

export default { pending };
