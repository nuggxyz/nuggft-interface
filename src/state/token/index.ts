import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { NLState } from '../NLState';

import hooks from './hooks';
import middlewares from './middlewares';
import thactions from './thactions';
import updater from './updater';

const STATE_NAME = 'token';

export enum TokenStatus {
    'MINT' = 0,
    'SALE' = 1,
    'STALE' = 2,
    'LIMBO' = 3,
    'PREMINT' = 4,
    'DEAD' = 5,
    'FETUS' = 6,
}

class TokenState extends NLState<NL.Redux.Token.State> {
    declare static _instance: TokenState;

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
            success: undefined,
            error: undefined,
            loading: false,
            tokenId: undefined,
            tokenURI: undefined,
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
            setNugg: (
                state,
                action: PayloadAction<
                    NL.GraphQL.Fragments.Nugg.ListItem | undefined
                >,
            ) => {
                if (action.payload) {
                    state.tokenId = action.payload.id;
                    state.tokenURI = action.payload.dotnuggRawCache;
                } else {
                    state.tokenId = undefined;
                    state.tokenURI = undefined;
                }
            },
        },
        extraReducers: (builder) => {
            builder
                .addMatcher(NLState.isPendingAction('token/'), (state) => {
                    state.loading = true;
                    state.success = undefined;
                    state.error = undefined;
                })
                .addMatcher(
                    NLState.isRejectedAction('token/'),
                    (state, action: PayloadAction<NL.Redux.Token.Error>) => {
                        state.loading = false;
                        state.error = action.payload;
                        state.success = undefined;
                    },
                )
                .addMatcher(
                    NLState.isFulfilledAction('token/'),
                    (
                        state,
                        action: PayloadAction<{
                            success: NL.Redux.Token.Success;
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

export default TokenState;
