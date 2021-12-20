import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { NLState } from '../NLState';

import ProtocolInitialState from './initialState';
import thactions from './thactions';

export const STATE_NAME = 'protocol';

const ProtocolSlice = createSlice({
    name: STATE_NAME,
    initialState: ProtocolInitialState,
    reducers: {
        clearSuccess: (state) => {
            state.success = undefined;
        },
        clearError: (state) => {
            state.error = undefined;
        },
        setCurrentBlock: (state, action: PayloadAction<number>) => {
            state.currentBlock = action.payload;
        },
    },
    extraReducers: (builder) =>
        builder
            .addCase(thactions.updateProtocol.fulfilled, (state, action) => {
                const data = action.payload.data;
                state.epoch = data.epoch;
                state.interval = data.interval;
                state.genesisBlock = data.genesisBlock;
                state.defaultActiveNugg = data.defaultActiveNugg;
                state.activeItems = data.activeItems;
                state.activeNuggs = data.activeNuggs;
                state.xnuggTotalSupply = data.xnuggTotalSupply;
                state.xnuggTotalEth = data.xnuggTotalEth;
                state.nuggftTotalEth = data.nuggftTotalEth;
                state.priceUsdcWeth = data.priceUsdcWeth;
                state.priceWethXnugg = data.priceWethXnugg;
                state.tvlEth = data.tvlEth;
                state.tvlUsd = data.tvlUsd;
                state.totalItemSwaps = data.totalItemSwaps;
                state.totalItems = data.totalItems;
                state.totalUsers = data.totalUsers;
                state.totalNuggs = data.totalNuggs;
                state.totalSwaps = data.totalSwaps;
                state.nuggftUser = data.nuggftUser;
                state.nullUser = data.nullUser;
                state.xnuggUser = data.xnuggUser;
            })
            .addCase(thactions.updateEpoch.fulfilled, (state, action) => {
                const data = action.payload.data;
                state.epoch = data.epoch;
                state.interval = data.interval;
                state.genesisBlock = data.genesisBlock;
            })
            .addCase(thactions.updateActives.fulfilled, (state, action) => {
                const data = action.payload.data;
                state.defaultActiveNugg = data.defaultActiveNugg;
                state.activeItems = data.activeItems;
                state.activeNuggs = data.activeNuggs;
            })
            .addCase(thactions.updateUsers.fulfilled, (state, action) => {
                const data = action.payload.data;
                state.nuggftUser = data.nuggftUser;
                state.nullUser = data.nullUser;
                state.xnuggUser = data.xnuggUser;
            })
            .addCase(thactions.updatePrices.fulfilled, (state, action) => {
                const data = action.payload.data;
                state.xnuggTotalSupply = data.xnuggTotalSupply;
                state.xnuggTotalEth = data.xnuggTotalEth;
                state.nuggftTotalEth = data.nuggftTotalEth;
                state.priceUsdcWeth = data.priceUsdcWeth;
                state.priceWethXnugg = data.priceWethXnugg;
                state.tvlEth = data.tvlEth;
                state.tvlUsd = data.tvlUsd;
            })
            .addCase(thactions.updateTotals.fulfilled, (state, action) => {
                const data = action.payload.data;
                state.totalItemSwaps = data.totalItemSwaps;
                state.totalItems = data.totalItems;
                state.totalUsers = data.totalUsers;
                state.totalNuggs = data.totalNuggs;
                state.totalSwaps = data.totalSwaps;
            })
            .addCase(thactions.updateStaked.fulfilled, (state, action) => {
                const data = action.payload.data;
                state.nuggftStakedUsdPerShare = data.nuggftStakedUsdPerShare;
                state.nuggftStakedUsd = data.nuggftStakedUsd;
                const totalShares = data.nuggftStakedShares;
                const totalEth = data.nuggftStakedEth;
                state.nuggftStakedEth = totalEth;
                state.nuggftStakedShares = totalShares;
                state.nuggftStakedEthPerShare =
                    totalShares === '0' ? '0' : `${+totalEth / +totalShares}`;
            })
            .addCase(thactions.updateBlock.fulfilled, (state, action) => {
                state.currentBlock = action.payload.data;
            })
            .addMatcher(NLState.isPendingAction(`${STATE_NAME}/`), (state) => {
                state.loading = true;
                state.success = undefined;
                state.error = undefined;
            })
            .addMatcher(
                NLState.isRejectedAction(`${STATE_NAME}/`),
                (state, action: PayloadAction<NL.Redux.Protocol.Error>) => {
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
                        success: NL.Redux.Protocol.Success;
                    }>,
                ) => {
                    state.loading = false;
                    state.error = undefined;
                    state.success = action.payload.success;
                },
            ),
});

export default ProtocolSlice;
