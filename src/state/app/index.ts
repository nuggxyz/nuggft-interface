import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
    isUndefinedOrNullOrObjectEmpty,
    smartInsert,
    smartRemove,
    smartReplace,
} from '../../lib';

import AppInitialState from './initialState';

export const STATE_NAME = 'app';

const AppSlice = createSlice({
    name: STATE_NAME,
    initialState: AppInitialState,
    reducers: {
        addToastToList: (state, action: PayloadAction<NL.Redux.App.Toast>) => {
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
            action: PayloadAction<Partial<NL.Redux.App.Toast> & { id: string }>,
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
        toggleWallet: (state) => {
            state.walletVisible = !state.walletVisible;
        },
    },
});

export default AppSlice;
