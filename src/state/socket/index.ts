import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { NLState } from '@src/state/NLState';

import hooks from './hooks';
import { SocketInfo, SocketType } from './interfaces';
import middlewares from './middlewares';
import thactions from './thactions';
import updater from './updater';

const STATE_NAME = 'socket';

class SocketState extends NLState<NL.Redux.Socket.State> {
    declare static _instance: SocketState;
    declare static hook: typeof hooks;

    declare static actions: typeof this.instance._slice.actions;
    declare static reducer: typeof this.instance._slice.reducer;
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
            Offer: undefined,
            ItemOffer: undefined,
            Claim: undefined,
            Stake: undefined,
            Mint: undefined,
            Block: undefined,
            swapsToWatch: [],
        });
    }

    protected override _slice = createSlice({
        name: this._name,
        initialState: this._initialState,
        reducers: {
            incomingEvent: (state, action: PayloadAction<SocketInfo>) => {
                switch (action.payload.type) {
                    case SocketType.STAKE:
                        state.Stake = action.payload;
                        break;
                    case SocketType.OFFER:
                        state.Offer = action.payload;
                        break;
                    case SocketType.ITEM_OFFER:
                        state.ItemOffer = action.payload;
                        break;
                    case SocketType.MINT:
                        state.Mint = action.payload;
                        break;
                    case SocketType.CLAIM:
                        state.Claim = action.payload;
                        break;
                    case SocketType.BLOCK:
                        state.Block = action.payload;
                        break;
                }
            },
            watchASwap: (state, action: PayloadAction<string>) => {
                state.swapsToWatch = [...state.swapsToWatch, action.payload];
            },
            unwatchASwap: (state, action: PayloadAction<string>) => {
                state.swapsToWatch = state.swapsToWatch.filter((x) => x === action.payload);
            },
        },
    });
}

export default SocketState;
