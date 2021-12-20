import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { NLState } from '../NLState';

import hooks from './hooks';
import middlewares from './middlewares';
import thactions from './thactions';
import updater from './updater';

export const STATE_NAME = 'wallet';

export default class WalletState extends NLState<NL.Redux.Wallet.State> {
    declare static _instance: WalletState;

    declare static actions: typeof this.instance._slice.actions;
    declare static reducer: typeof this.instance._slice.reducer;
    declare static select: ApplyFuncToChildren<
        typeof this.instance._initialState
    >;
    declare static dispatch: ApplyDispatchToChildren<
        typeof thactions & typeof this.instance._slice.actions
    >;

    static override get instance() {
        if (this._instance === undefined) this._instance = new this();
        return this._instance;
    }

    constructor() {
        super(STATE_NAME, updater, middlewares, thactions, hooks, {
            error: undefined,
            success: undefined,
            loading: false,
            userShares: 0,
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
        },
        extraReducers: (builder) =>
            builder
                .addCase(thactions.getUserShares.fulfilled, (state, action) => {
                    state.userShares = action.payload.data;
                })
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
                    (state, action: PayloadAction<NL.Redux.Wallet.Error>) => {
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
                            success: NL.Redux.Wallet.Success;
                        }>,
                    ) => {
                        state.loading = false;
                        state.error = undefined;
                        state.success = action.payload.success;
                    },
                ),
    });
}
