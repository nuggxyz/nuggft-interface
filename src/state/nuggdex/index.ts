import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { isUndefinedOrNullOrArrayEmpty } from '../../lib';
import { NLState } from '../NLState';

import NuggDexInitialState from './initialState';
import thactions from './thactions';

export const STATE_NAME = 'nuggdex';

const NuggDexSlice = createSlice({
    name: STATE_NAME,
    initialState: NuggDexInitialState,
    reducers: {
        clearSuccess: (state) => {
            state.success = undefined;
        },
        clearError: (state) => {
            state.error = undefined;
        },
        setViewing: (
            state,
            action: PayloadAction<NL.Redux.NuggDex.SearchViews>,
        ) => {
            state.viewing = action.payload;
        },
        setThumbnail: (
            state,
            action: PayloadAction<NL.GraphQL.Fragments.Nugg.Thumbnail>,
        ) => {
            state.thumbnails[action.payload.id] = action.payload;
        },
        addToRecents: (state, action: PayloadAction<string>) => {
            if (state.recents.indexOf(action.payload) === -1) {
                state.recents.push(action.payload);
            }
        },
        refillRecents: (state, action: PayloadAction<string[]>) => {
            state.recents = !isUndefinedOrNullOrArrayEmpty(action.payload)
                ? action.payload
                : [];
        },
        setContinueSearch: (
            state,
            action: PayloadAction<'no' | 'no_' | 'yes' | 'yes_'>,
        ) => {
            state.continueSearch = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(thactions.searchTokens.fulfilled, (state, action) => {
                state.searchResults = action.payload.data;
            })
            .addCase(thactions.initNuggDex.fulfilled, (state, action) => {
                const data = action.payload.data;
                state.activeNuggs = data.activeNuggs;
                state.myNuggs = data.myNuggs;
                state.allNuggs = data.allNuggs;
            })
            .addCase(thactions.getNuggThumbnail.fulfilled, (state, action) => {
                state.thumbnails[action.meta.arg.id] = action.payload.data;
            })
            .addMatcher(NLState.isPendingAction(`${STATE_NAME}/`), (state) => {
                state.loading = true;
                state.success = undefined;
                state.error = undefined;
            })
            .addMatcher(
                NLState.isRejectedAction(`${STATE_NAME}/`),
                (state, action: PayloadAction<NL.Redux.NuggDex.Error>) => {
                    state.loading = false;
                    state.error = action.payload;
                    state.success = undefined;
                },
            )
            .addMatcher(
                NLState.isFulfilledAction(`${STATE_NAME}/`),
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

export default NuggDexSlice;
