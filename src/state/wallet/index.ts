import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { NLState } from '../NLState';

import WalletInitialState from './initialState';
import WalletThactions from './thactions';

export const STATE_NAME = 'wallet';

const WalletSlice = createSlice({
    name: STATE_NAME,
    initialState: WalletInitialState,
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
            .addCase(
                WalletThactions.getUnclaimedOffers.fulfilled,
                (state, action) => {
                    state.unclaimedOffers = action.payload.data;
                },
            )
            .addCase(WalletThactions.getHistory.fulfilled, (state, action) => {
                state.history = action.payload.data;
            })
            .addCase(
                WalletThactions.getUserShares.fulfilled,
                (state, action) => {
                    state.userShares = action.payload.data;
                },
            )
            .addMatcher(NLState.isPendingAction(`${STATE_NAME}/`), (state) => {
                state.loading = true;
                state.success = undefined;
                state.error = undefined;
            })
            .addMatcher(
                NLState.isRejectedAction(`${STATE_NAME}/`),
                (state, action: PayloadAction<NL.Redux.Wallet.Error>) => {
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
                        success: NL.Redux.Wallet.Success;
                    }>,
                ) => {
                    state.loading = false;
                    state.error = undefined;
                    state.success = action.payload.success;
                },
            ),
});

export default WalletSlice;
