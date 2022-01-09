import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { NLState } from '../NLState';

import hooks from './hooks';
import { BaseTransactionInfo } from './interfaces';
import middlewares from './middlewares';
import updater from './updater';

const STATE_NAME = 'transaction';

export default class TransactionState extends NLState<NL.Redux.Transaction.State> {
    declare static _instance: TransactionState;

    declare static actions: typeof this.instance._slice.actions;
    declare static reducer: typeof this.instance._slice.reducer;
    declare static select: ApplyFuncToChildren<
        typeof this.instance._initialState
    >;
    declare static dispatch: ApplyDispatchToChildren<
        typeof this.instance._slice.actions
    >;

    static get instance() {
        if (this._instance === undefined) this._instance = new this();
        return this._instance;
    }

    constructor() {
        super(STATE_NAME, updater, middlewares, {}, hooks, {
            txn: '',
            toggleCompletedTxn: false,
            success: undefined,
            error: undefined,
            loading: false,
        });
    }

    protected override _slice = createSlice({
        name: this._name,
        initialState: this._initialState,
        reducers: {
            clearSuccess: (state) => {
                state.success = undefined;
            },
            clearError: (state) => {
                state.error = undefined;
            },
            clearTransaction: (state) => {
                state.txn = '';
            },
            initiate: (_, __: PayloadAction<{ _pendingtx: any }>) => {},
            addTransaction: (state, action: PayloadAction<string>) => {
                state.txn = action.payload;
            },
            finalizeTransaction: (
                state,
                _: PayloadAction<{
                    hash: string;
                    successful: boolean;
                }>,
            ) => {
                state.toggleCompletedTxn = !state.toggleCompletedTxn;
            },
            reset: (state) => {
                state.txn = '';
                state.toggleCompletedTxn = false;
                state.success = undefined;
                state.error = undefined;
                state.loading = false;
            },
        },
        extraReducers: (builder) =>
            builder
                .addMatcher(
                    NLState.isPendingAction(`${this._name}/`),
                    (state) => {
                        state.loading = true;
                        state.success = undefined;
                        state.error = undefined;
                    },
                )
                .addMatcher(
                    NLState.isRejectedAction(`${this._name}/`),
                    (
                        state,
                        action: PayloadAction<NL.Redux.Transaction.Error>,
                    ) => {
                        state.loading = false;
                        state.error = action.payload;
                        state.success = undefined;
                    },
                )
                .addMatcher(
                    NLState.isFulfilledAction(`${this._name}/`),
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
}
