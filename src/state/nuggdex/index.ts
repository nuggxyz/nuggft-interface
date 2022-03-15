/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { NLState } from '@src/state/NLState';

import hooks from './hooks';
import middlewares from './middlewares';
import thactions from './thactions';
import updater from './updater';

const STATE_NAME = 'nuggdex';

class NuggDexState extends NLState<NuggDexStateType> {
    // eslint-disable-next-line no-use-before-define
    declare static _instance: NuggDexState;

    declare static actions: typeof this.instance._slice.actions;

    declare static reducer: typeof this.instance._slice.reducer;

    declare static hook: typeof hooks;

    declare static select: ApplyFuncToChildren<typeof this.instance._initialState>;

    declare static dispatch: ApplyDispatchToChildren<
        typeof thactions & typeof this.instance._slice.actions
    >;

    static get instance() {
        if (this._instance === undefined) this._instance = new this();
        return this._instance;
    }

    constructor() {
        super(STATE_NAME, updater, middlewares, thactions, hooks, {
            viewing: 'home',
            success: undefined,
            error: undefined,
            loading: false,
            searchFilters: {
                target: undefined,
                searchValue: '',
                sort: {
                    asc: false,
                    by: 'id',
                },
            },
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
            setViewing: (state, action: PayloadAction<NuggDexSearchViews>) => {
                state.viewing = action.payload;
            },
            // addToRecents: (state, action: PayloadAction<NL.GraphQL.Fragments.Nugg.ListItem>) => {
            //     // if (!state.recents.find((recent) => recent.id === action.payload.id)) {
            //     //     // @ts-ignore
            //     //     // there is a type (unused by redux) from zustand that throws errors here
            //     //     delete action.payload.eth;
            //     //     state.recents.push(action.payload);
            //     // }
            // },
            setSearchFilters: (state, action: PayloadAction<Partial<NuggDexFilters>>) => {
                state.searchFilters = { ...state.searchFilters, ...action.payload };
            },
            reset: (state) => {
                // state.recents = [];
                state.viewing = 'home';
                state.success = undefined;
                state.error = undefined;
                state.loading = false;
                state.searchFilters = {
                    target: undefined,
                    searchValue: '',
                    sort: {
                        asc: false,
                        by: 'id',
                    },
                };
            },
        },
        extraReducers: (builder) => {
            builder
                .addMatcher(NLState.isPendingAction('nuggdex/'), (state) => {
                    state.loading = true;
                    state.success = undefined;
                    state.error = undefined;
                })
                .addMatcher(
                    NLState.isRejectedAction('nuggdex/'),
                    (state, action: PayloadAction<NuggDexError>) => {
                        state.loading = false;
                        state.error = action.payload;
                        state.success = undefined;
                    },
                )
                .addMatcher(
                    NLState.isFulfilledAction('nuggdex/'),
                    (
                        state,
                        action: PayloadAction<{
                            success: NuggDexSuccess;
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

export default NuggDexState;
