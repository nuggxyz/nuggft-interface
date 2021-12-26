import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { isUndefinedOrNullOrObjectEmpty } from '../../lib';
import { NLState } from '../NLState';

import hooks from './hooks';
import middlewares from './middlewares';
import thactions from './thactions';
import updater from './updater';

const STATE_NAME = 'swap';

class SwapState extends NLState<NL.Redux.Swap.State> {
    declare static _instance: SwapState;

    declare static actions: typeof this.instance._slice.actions;
    declare static reducer: typeof this.instance._slice.reducer;
    declare static hook: typeof hooks;

    declare static select: ApplyFuncToChildren<
        typeof this.instance._initialState
    >;
    declare static dispatch: ApplyDispatchToChildren<
        typeof thactions & typeof this.instance._slice.actions
    >;

    static get instance() {
        if (this._instance === undefined) this._instance = new this();
        return this._instance;
    }

    constructor() {
        super(STATE_NAME, updater, middlewares, thactions, hooks, {
            error: undefined,
            lastUpdated: undefined,
            loading: false,
            success: undefined,
            eth: undefined,
            ethUsd: undefined,
            id: undefined,
            leader: undefined,
            nugg: undefined,
            offers: [],
            owner: undefined,
            status: 'waiting',
            epoch: undefined,
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
            clearData: (state) => {
                state.error = undefined;
                state.lastUpdated = undefined;
                state.loading = false;
                state.success = undefined;
                state.eth = undefined;
                state.ethUsd = undefined;
                state.id = undefined;
                state.leader = undefined;
                state.nugg = undefined;
                state.offers = [];
                state.owner = undefined;
            },
            setStatus: (state, action: PayloadAction<NL.Redux.Swap.Status>) => {
                state.status = action.payload;
            },
        },
        extraReducers: (builder) => {
            builder
                .addCase(thactions.initSwap.fulfilled, (state, action) => {
                    const swap = action.payload.data.swap;
                    state.nugg = swap.nugg;
                    state.owner = swap.owner;
                    state.offers = swap.offers;
                    state.id = swap.id;
                    state.leader = swap.leader;
                    state.eth = swap.eth;
                    state.ethUsd = swap.ethUsd;
                    state.lastUpdated = Date.now();
                    state.status = action.payload.data.status;
                    state.epoch = swap.epoch;
                })
                .addCase(thactions.pollOffers.fulfilled, (state, action) => {
                    state.offers = action.payload.data;
                    const top = action.payload.data[0];
                    if (!isUndefinedOrNullOrObjectEmpty(top)) {
                        state.eth = top.eth;
                        state.ethUsd = top.ethUsd;
                        state.leader = top.user;
                    }
                })
                .addMatcher(NLState.isPendingAction('swap/'), (state) => {
                    state.loading = true;
                    state.success = undefined;
                    state.error = undefined;
                })
                .addMatcher(
                    NLState.isRejectedAction('swap/'),
                    (state, action: PayloadAction<NL.Redux.Swap.Error>) => {
                        state.loading = false;
                        state.error = action.payload;
                        state.success = undefined;
                    },
                )
                .addMatcher(
                    NLState.isFulfilledAction('swap/'),
                    (
                        state,
                        action: PayloadAction<{
                            success: NL.Redux.Swap.Success;
                        }>,
                    ) => {
                        state.loading = false;
                        state.error = undefined;
                        state.success = action.payload.success;
                    },
                );
        },
    });
}

export default SwapState;
