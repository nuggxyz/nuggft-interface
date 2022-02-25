import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { isUndefinedOrNullOrArrayEmpty } from '../../lib';
import { NLState } from '../NLState';

import hooks from './hooks';
import middlewares from './middlewares';
import thactions from './thactions';
import updater from './updater';

const STATE_NAME = 'nuggdex';

class NuggDexState extends NLState<NL.Redux.NuggDex.State> {
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
            recents: [],
            myNuggs: [],
            activeNuggs: [],
            allNuggs: [],
            thumbnails: {},
            viewing: 'home',
            success: undefined,
            error: undefined,
            loading: false,
            searchFilters: {
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
            setViewing: (state, action: PayloadAction<NL.Redux.NuggDex.SearchViews>) => {
                state.viewing = action.payload;
            },
            setThumbnail: (state, action: PayloadAction<NL.GraphQL.Fragments.Nugg.Thumbnail>) => {
                state.thumbnails[action.payload.id] = action.payload;
            },
            addToRecents: (state, action: PayloadAction<NL.GraphQL.Fragments.Nugg.ListItem>) => {
                if (!state.recents.find((recent) => recent.id === action.payload.id)) {
                    state.recents.push(action.payload);
                }
            },
            refillRecents: (state, action: PayloadAction<NL.GraphQL.Fragments.Nugg.ListItem[]>) => {
                state.recents = !isUndefinedOrNullOrArrayEmpty(action.payload)
                    ? action.payload
                    : [];
            },
            setSearchFilters: (state, action: PayloadAction<NL.Redux.NuggDex.Filters>) => {
                state.searchFilters = action.payload;
            },
            reset: (state) => {
                state.recents = [];
                state.myNuggs = [];
                state.activeNuggs = [];
                state.allNuggs = [];
                state.thumbnails = {};
                state.viewing = 'home';
                state.success = undefined;
                state.error = undefined;
                state.loading = false;
                state.searchFilters = {
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
                // .addCase(thactions.initNuggDex.fulfilled, (state, action) => {
                //     const data = action.payload.data;
                //     state.activeNuggs = data.activeNuggs;
                //     state.myNuggs = data.myNuggs;
                //     state.allNuggs = data.allNuggs;
                // })
                .addCase(thactions.getNuggThumbnail.fulfilled, (state, action) => {
                    state.thumbnails[action.meta.arg.id] = action.payload.data;
                })
                .addMatcher(NLState.isPendingAction('nuggdex/'), (state) => {
                    state.loading = true;
                    state.success = undefined;
                    state.error = undefined;
                })
                .addMatcher(
                    NLState.isRejectedAction('nuggdex/'),
                    (state, action: PayloadAction<NL.Redux.NuggDex.Error>) => {
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
                            success: NL.Redux.NuggDex.Success;
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
