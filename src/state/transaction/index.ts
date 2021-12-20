import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
    isFulfilledAction,
    isPendingAction,
    isRejectedAction,
} from '../helpers';

import TransactionInitialState from './initialState';

export const STATE_NAME = 'transaction';

const TransactionSlice = createSlice({
    name: STATE_NAME,
    initialState: TransactionInitialState,
    reducers: {
        clearSuccess: (state) => {
            state.success = undefined;
        },
        clearError: (state) => {
            state.error = undefined;
        },
        clearTransactions: (state) => {
            state.txs = {};
        },
        addTransaction: (
            state,
            action: PayloadAction<{
                hash: string;
                from: string;
                info: NL.Redux.Transaction.Info;
            }>,
        ) => {
            if (state.txs?.[action.payload.hash]) {
                return; // TODO maybe throw error?
            }
            state.txs[action.payload.hash] = {
                hash: action.payload.hash,
                info: action.payload.info,
                from: action.payload.from,
                addedTime: new Date().getTime(),
            };
        },
        finalizeTransaction: (
            state,
            action: PayloadAction<{
                hash: string;
                receipt: NL.TransactionReceipt;
            }>,
        ) => {
            if (!state.txs?.[action.payload.hash]) {
                return; // TODO maybe throw error?
            }
            state.txs[action.payload.hash].receipt = action.payload.receipt;
            state.txs[action.payload.hash].confirmedTime = new Date().getTime();
            state.toggleCompletedTxn = !state.toggleCompletedTxn;
        },
        checkedTransaction: (
            state,
            action: PayloadAction<{
                hash: string;
                blockNumber: number;
            }>,
        ) => {
            if (!state.txs?.[action.payload.hash]) {
                return; // TODO maybe throw error?
            }
            if (!state.txs[action.payload.hash].lastCheckedBlockNumber) {
                state.txs[action.payload.hash].lastCheckedBlockNumber =
                    action.payload.blockNumber;
            } else {
                state.txs[action.payload.hash].lastCheckedBlockNumber =
                    Math.max(
                        action.payload.blockNumber,
                        state.txs[action.payload.hash].lastCheckedBlockNumber,
                    );
            }
        },
    },
    extraReducers: (builder) =>
        builder
            .addMatcher(isPendingAction(`${STATE_NAME}/`), (state) => {
                state.loading = true;
                state.success = undefined;
                state.error = undefined;
            })
            .addMatcher(
                isRejectedAction(`${STATE_NAME}/`),
                (state, action: PayloadAction<NL.Redux.Transaction.Error>) => {
                    state.loading = false;
                    state.error = action.payload;
                    state.success = undefined;
                },
            )
            .addMatcher(
                isFulfilledAction(`${STATE_NAME}/`),
                (
                    state,
                    action: PayloadAction<{
                        success: NL.Redux.Transaction.Success;
                    }>,
                ) => {
                    state.loading = false;
                    state.error = undefined;
                    state.success = action.payload.success;
                },
            ),
});

export default TransactionSlice;
