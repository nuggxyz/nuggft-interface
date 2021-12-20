import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
    isFulfilledAction,
    isPendingAction,
    isRejectedAction,
} from '../helpers';

import TokenInitialState from './initialState';
import TokenThactions from './thactions';

export const STATE_NAME = 'token';

const TokenSlice = createSlice({
    name: STATE_NAME,
    initialState: TokenInitialState,
    reducers: {
        clearSuccess: (state) => {
            state.success = undefined;
        },
        clearError: (state) => {
            state.error = undefined;
        },
        setTokenFromThumbnail: (
            state,
            action: PayloadAction<NL.GraphQL.Fragments.Nugg.Thumbnail>,
        ) => {
            state.tokenId = action.payload.id;
            state.swaps = action.payload.swaps;
            state.owner = action.payload.user.id;
        },
        setTokenFromId: (state, action: PayloadAction<string>) => {
            state.tokenId = action.payload;
            state.swaps = [];
            state.owner = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(
                TokenThactions.getSwapHistory.fulfilled,
                (state, action) => {
                    state.swaps = action.payload.data;
                },
            )
            .addMatcher(isPendingAction(`${STATE_NAME}/`), (state) => {
                state.loading = true;
                state.success = undefined;
                state.error = undefined;
            })
            .addMatcher(
                isRejectedAction(`${STATE_NAME}/`),
                (state, action: PayloadAction<NL.Redux.Token.Error>) => {
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

export default TokenSlice;
