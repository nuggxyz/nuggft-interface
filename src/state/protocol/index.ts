import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { NLState } from '../NLState';

import hooks from './hooks';
import middlewares from './middlewares';
import thactions from './thactions';
import updater from './updater';

export const STATE_NAME = 'protocol';

export default class ProtocolState extends NLState<NL.Redux.Protocol.State> {
    declare static _instance: ProtocolState;

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
            id: undefined,
            currentBlock: 0,
            init: false,
            epoch: undefined,
            totalSwaps: '0',
            totalUsers: '0',
            totalNuggs: '0',
            totalItems: '0',
            totalItemSwaps: '0',
            genesisBlock: undefined,
            interval: '0',
            xnuggTotalSupply: '0',
            xnuggTotalEth: '0',
            nuggftTotalEth: '0',
            nuggftStakedUsdPerShare: '0',
            nuggftStakedUsd: '0',
            nuggftStakedEthPerShare: '0',
            nuggftStakedEth: '0',
            nuggftStakedShares: '0',
            priceUsdcWeth: '0',
            priceWethXnugg: '0',
            tvlEth: '0',
            tvlUsd: '0',
            defaultActiveNugg: undefined,
            activeNuggs: [],
            activeItems: [],
            error: undefined,
            success: undefined,
            loading: false,
            xnuggUser: undefined,
            nuggftUser: undefined,
            nullUser: undefined,
        });
    }

    protected override _slice = createSlice({
        name: 'protocol',
        initialState: this._initialState,
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
            setGenesisBlock: (state, action: PayloadAction<number>) => {
                state.genesisBlock = action.payload;
            },
            setEpoch: (
                state,
                action: PayloadAction<NL.GraphQL.Epoch<NL.GraphQL.Scalars>>,
            ) => {
                state.epoch = action.payload;
            },
        },
        extraReducers: (builder) =>
            builder
                .addCase(
                    thactions.updateProtocol.fulfilled,
                    (state, action) => {
                        const data = action.payload.data;
                        state.epoch = data.epoch;
                        state.interval = data.interval;
                        // state.genesisBlock = data.genesisBlock;
                        state.defaultActiveNugg = data.defaultActiveNugg;
                        state.activeItems = data.activeItems;
                        // state.activeNuggs = data.activeNuggs;
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
                    },
                )
                .addCase(thactions.updateEpoch.fulfilled, (state, action) => {
                    const data = action.payload.data;
                    state.epoch = data.epoch;
                    state.interval = data.interval;
                    state.genesisBlock = data.genesisBlock;
                    state.nuggftStakedUsdPerShare =
                        data.nuggftStakedUsdPerShare;
                    state.nuggftStakedUsd = data.nuggftStakedUsd;
                    const totalShares = data.nuggftStakedShares;
                    const totalEth = data.nuggftStakedEth;
                    state.nuggftStakedEth = totalEth;
                    state.nuggftStakedShares = totalShares;
                    const perShare =
                        totalShares === '0'
                            ? '0'
                            : `${+totalEth / +totalShares}`;
                    state.nuggftStakedEthPerShare = perShare.split('.')[0];
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
                    state.nuggftStakedUsdPerShare =
                        data.nuggftStakedUsdPerShare;
                    state.nuggftStakedUsd = data.nuggftStakedUsd;
                    const totalShares = data.nuggftStakedShares;
                    const totalEth = data.nuggftStakedEth;
                    state.nuggftStakedEth = totalEth;
                    state.nuggftStakedShares = totalShares;
                    const perShare =
                        totalShares === '0'
                            ? '0'
                            : `${+totalEth / +totalShares}`;
                    state.nuggftStakedEthPerShare = perShare.split('.')[0];
                })
                .addCase(thactions.updateBlock.fulfilled, (state, action) => {
                    state.currentBlock = action.payload.data;
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
                    (state, action: PayloadAction<NL.Redux.Protocol.Error>) => {
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
                            success: NL.Redux.Protocol.Success;
                        }>,
                    ) => {
                        state.loading = false;
                        state.error = undefined;
                        state.success = action.payload.success;
                    },
                ),
    });
}
