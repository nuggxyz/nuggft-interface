import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import UAParser from 'ua-parser-js';

import {
    isUndefinedOrNullOrObjectEmpty,
    smartInsertIndex,
    smartRemove,
    smartReplace,
} from '@src/lib';
import { NLState } from '@src/state/NLState';

import hooks from './hooks';
import middlewares from './middlewares';
import thactions from './thactions';
import updater from './updater';

const STATE_NAME = 'app';

class AppState extends NLState<NL.Redux.App.State> {
    declare static _instance: AppState;

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

    static userAgent: UAParser.IResult;
    static isMobile: boolean;

    constructor() {
        super(STATE_NAME, updater, middlewares, thactions, hooks, {
            dimensions: {
                height: 0,
                width: 0,
            },
            screenType: 'desktop',
            toasts: [],
            modalIsOpen: undefined,
            modalData: {},
            view: 'Swap',
            mobileView: 'Mint',
            walletVisible: false,
            walletManagerVisable: false,
        });

        const parser = new UAParser(window.navigator.userAgent);
        const { type } = parser.getDevice();

        AppState.userAgent = parser.getResult();

        AppState.isMobile = type === 'mobile' || type === 'tablet';
    }

    protected override _slice = createSlice({
        name: this._name,
        initialState: this._initialState,
        reducers: {
            setWindowDimensions: (
                state,
                action: PayloadAction<{ height: number; width: number }>,
            ) => {
                state.dimensions = action.payload;
                state.screenType =
                    action.payload.width > 1300
                        ? 'desktop'
                        : action.payload.width > 750
                        ? 'tablet'
                        : 'phone';
            },
            addToastToList: (state, action: PayloadAction<NL.Redux.App.Toast>) => {
                let temp = state.toasts;
                state.toasts = smartInsertIndex(temp, action.payload);
            },
            toggleWalletManager: (state) => {
                state.walletManagerVisable = !state.walletManagerVisable;
            },
            removeToastFromList: (
                state,
                action: PayloadAction<Partial<NL.Redux.App.Toast> & { index: number }>,
            ) => {
                // @ts-ignore
                state.toasts = smartRemove(state.toasts, action.payload);
            },
            replaceToast: (
                state,
                action: PayloadAction<Partial<NL.Redux.App.Toast> & { id: string }>,
            ) => {
                let temp = state.toasts;
                // @ts-ignore
                state.toasts = smartReplace(temp, action.payload);
            },
            setModalOpen: (state, action: PayloadAction<NL.Redux.App.Modals>) => {
                state.modalIsOpen = action.payload.name;
                state.modalData = !isUndefinedOrNullOrObjectEmpty(action.payload.modalData)
                    ? action.payload.modalData
                    : {};
            },
            setModalClosed: (state) => {
                state.modalIsOpen = undefined;
                state.modalData = {};
            },
            changeView: (state, action: PayloadAction<NL.Redux.App.Views>) => {
                state.view = action.payload;
            },
            changeMobileView: (state, action: PayloadAction<NL.Redux.App.MobileViews>) => {
                state.mobileView = action.payload;
            },
            toggleWallet: (state) => {
                state.walletVisible = !state.walletVisible;
            },
        },
    });

    public static silentlySetRoute(route: string) {
        window.location.hash = route;
    }
}

export default AppState;
