import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BigNumber } from 'ethers';

import { NLState } from '@src/state/NLState';

import hooks from './hooks';
import middlewares from './middlewares';
import thactions from './thactions';
import updater from './updater';

export const STATE_NAME = 'protocol';

export default class ProtocolState extends NLState<NL.Redux.Protocol.State> {
    declare static _instance: ProtocolState;

    declare static actions: typeof this.instance._slice.actions;
    declare static reducer: typeof this.instance._slice.reducer;
    declare static select: ApplyFuncToChildren<typeof this.instance._initialState>;
    declare static dispatch: ApplyDispatchToChildren<
        typeof thactions & typeof this.instance._slice.actions
    >;

    static override get instance() {
        if (this._instance === undefined) this._instance = new this();
        return this._instance;
    }

    constructor() {
        super(STATE_NAME, updater, middlewares, thactions, hooks, {
            epoch: undefined,
            genesisBlock: undefined,
            nuggftStakedUsdPerShare: '0',
            nuggftStakedEthPerShare: '0',
            error: undefined,
            success: undefined,
            loading: false,
            epochIsOver: false,
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
            setStaked: (
                state,
                action: PayloadAction<{
                    stakedShares: string;
                    stakedEth: string;
                }>,
            ) => {
                state.nuggftStakedEthPerShare =
                    action.payload.stakedShares === '0'
                        ? '0'
                        : BigNumber.from(action.payload.stakedEth)
                              .div(action.payload.stakedShares)
                              .toString();
            },
            setEpochIsOver: (state, action: PayloadAction<boolean>) => {
                state.epochIsOver = action.payload;
            },
            reset: (state) => {
                state.epoch = {
                    endblock: '0',
                    startblock: '0',
                    id: '0',
                    status: undefined,
                };
                state.genesisBlock = undefined;
                state.nuggftStakedEthPerShare = '0';
                state.error = undefined;
                state.success = undefined;
                state.loading = false;
                state.epochIsOver = false;
            },
        },
        extraReducers: (builder) =>
            builder
                .addCase(thactions.getGenesisBlock.fulfilled, (state, action) => {
                    state.genesisBlock = action.payload.data;
                })
                .addCase(thactions.safeSetEpoch.fulfilled, (state, action) => {
                    state.epoch = action.payload.data.epoch;
                    state.epochIsOver = action.payload.data.isOver;
                })
                .addCase(thactions.updateStaked.fulfilled, (state, action) => {
                    const data = action.payload.data;

                    state.nuggftStakedUsdPerShare = data.nuggftStakedUsdPerShare;
                    const totalShares = data.nuggftStakedShares;
                    const totalEth = data.nuggftStakedEth;
                    const perShare = totalShares === '0' ? '0' : `${+totalEth / +totalShares}`;
                    state.nuggftStakedEthPerShare = perShare.split('.')[0];
                })
                .addMatcher(NLState.isPendingAction(`${this._name}/`), (state) => {
                    state.loading = true;
                    state.success = undefined;
                    state.error = undefined;
                })
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
