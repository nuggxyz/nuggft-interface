import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import UAParser from 'ua-parser-js';

import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
    smartInsert,
    smartRemove,
    smartReplace,
} from '../../lib';
import Layout from '../../lib/layout';
import { NLState } from '../NLState';
import store from '../store';
import SwapState from '../swap';
import TokenState from '../token';

import hooks from './hooks';
import middlewares from './middlewares';
import thactions from './thactions';
import updater from './updater';

const STATE_NAME = 'app';

class AppState extends NLState<NL.Redux.App.State> {
    declare static _instance: AppState;

    declare static actions: typeof this.instance._slice.actions;
    declare static reducer: typeof this.instance._slice.reducer;
    declare static select: ApplyFuncToChildren<
        typeof this.instance._initialState
    >;
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
            toasts: [],
            modalIsOpen: undefined,
            modalData: {},
            view: 'Swap',
            mobileView: 'Mint',
            walletVisible: false,
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
            addToastToList: (
                state,
                action: PayloadAction<NL.Redux.App.Toast>,
            ) => {
                let temp = state.toasts;
                state.toasts = smartInsert(temp, action.payload);
            },
            removeToastFromList: (
                state,
                action: PayloadAction<NL.Redux.App.Toast>,
            ) => {
                let temp = state.toasts;
                state.toasts = smartRemove(temp, action.payload);
            },
            replaceToast: (
                state,
                action: PayloadAction<
                    Partial<NL.Redux.App.Toast> & { id: string }
                >,
            ) => {
                let temp = state.toasts;
                state.toasts = smartReplace(temp, action.payload);
            },
            setModalOpen: (
                state,
                action: PayloadAction<{
                    name: NL.Redux.App.Modals;
                    modalData?: NL.Redux.App.ModalsData;
                }>,
            ) => {
                state.modalIsOpen = action.payload.name;
                state.modalData = !isUndefinedOrNullOrObjectEmpty(
                    action.payload.modalData,
                )
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
            changeMobileView: (
                state,
                action: PayloadAction<NL.Redux.App.MobileViews>,
            ) => {
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

    public static onRouteUpdate(route: string) {
        try {
            const swapRoute = route.match(/\/(swap)\/(\d+)\-(\d+)/);
            const tokenRoute = route.match(/\/(nugg)\/(\d+)/);

            const soloTokenRoute = route.match(/\/(nugg)((?=\/)\/|.*)/);

            const currentView = store.getState().app.view;

            const currentEpoch = !isUndefinedOrNullOrObjectEmpty(
                store.getState().protocol.epoch,
            )
                ? store.getState().protocol.epoch.id
                : '';

            if (
                route === '/' &&
                !isUndefinedOrNullOrStringEmpty(currentEpoch)
            ) {
                SwapState.dispatch.initSwap({
                    swapId: `${currentEpoch}-0`,
                });
                if (AppState.isMobile) {
                    AppState.dispatch.changeMobileView('Mint');
                } else if (currentView !== 'Swap') {
                    AppState.dispatch.changeView('Swap');
                }
            } else if (
                !isUndefinedOrNullOrArrayEmpty(swapRoute) &&
                swapRoute.length === 4 &&
                swapRoute[1] === 'swap'
            ) {
                console.log(`${swapRoute[2]}-${swapRoute[3]}`);
                SwapState.dispatch.initSwap({
                    swapId: `${swapRoute[2]}-${swapRoute[3]}`,
                });
                if (AppState.isMobile) {
                    AppState.dispatch.changeMobileView('Mint');
                } else if (currentView !== 'Swap') {
                    AppState.dispatch.changeView('Swap');
                }
            } else if (
                !isUndefinedOrNullOrArrayEmpty(tokenRoute) &&
                tokenRoute.length === 3 &&
                tokenRoute[1] === 'nugg'
            ) {
                if (!isUndefinedOrNullOrStringEmpty(currentEpoch)) {
                    SwapState.dispatch.initSwap({
                        swapId: `${currentEpoch}-0`,
                    });
                }
                TokenState.dispatch.setTokenFromId(tokenRoute[2]);
                if (AppState.isMobile) {
                    AppState.dispatch.changeMobileView('Search');
                } else if (currentView !== 'Search') {
                    AppState.dispatch.changeView('Search');
                }
            } else if (!isUndefinedOrNullOrArrayEmpty(soloTokenRoute)) {
                if (currentView !== 'Search') {
                    AppState.dispatch.changeView('Search');
                }
            }
            AppState.silentlySetRoute(route);
        } catch (error) {
            console.log(error);
        }
    }
}

export default AppState;
