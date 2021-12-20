import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { isUndefinedOrNullOrObjectEmpty } from '../../lib';
import {
    isFulfilledAction,
    isPendingAction,
    isRejectedAction,
} from '../helpers';

import SwapInitialState from './initialState';
import thactions from './thactions';

export const STATE_NAME = 'swap';

const SwapSlice = createSlice({
    name: STATE_NAME,
    initialState: SwapInitialState,
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
            .addMatcher(isPendingAction(`${STATE_NAME}/`), (state) => {
                state.loading = true;
                state.success = undefined;
                state.error = undefined;
            })
            .addMatcher(
                isRejectedAction(`${STATE_NAME}/`),
                (state, action: PayloadAction<NL.Redux.Swap.Error>) => {
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

export default SwapSlice;
