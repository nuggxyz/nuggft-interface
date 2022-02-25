import { createSlice } from '@reduxjs/toolkit';

import { NLState } from '@src/state/NLState';

import middlewares from './middlewares';
import updater from './updater';
import hooks from './hooks';

const STATE_NAME = 'web32';

export default class Web32State extends NLState<NL.Redux.Web32.State> {
    declare static _instance: Web32State;

    declare static actions: typeof this.instance._slice.actions;
    declare static reducer: typeof this.instance._slice.reducer;
    declare static hook: typeof hooks;

    declare static select: ApplyFuncToChildren<typeof this.instance._initialState>;
    declare static dispatch: ApplyDispatchToChildren<typeof this.instance._slice.actions>;

    static get instance() {
        if (this._instance === undefined) this._instance = new this();
        return this._instance;
    }

    constructor() {
        super(STATE_NAME, updater, middlewares, {}, hooks, {});
    }

    protected override _slice = createSlice({
        name: this._name,
        initialState: this._initialState,
        reducers: {},
    });
}
