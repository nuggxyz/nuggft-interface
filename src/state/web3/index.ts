import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { SupportedChainId } from './config';
import Web3InitialState from './initialState';

export const STATE_NAME = 'web3';

const Web3Slice = createSlice({
    name: STATE_NAME,
    initialState: Web3InitialState,
    reducers: {
        setImplements3085: (state, action: PayloadAction<boolean>) => {
            state.implements3085 = action.payload;
        },
        setConnectivityWarning: (state, action: PayloadAction<boolean>) => {
            state.connectivityWarning = action.payload;
        },
        setWeb3Address: (state, action: PayloadAction<string>) => {
            state.web3address = action.payload;
        },
        clearWeb3Address: (state) => {
            state.web3address = undefined;
            state.web3status = 'NOT_SELECTED';
        },
        setWeb3Status: (
            state,
            action: PayloadAction<NL.Redux.Web3.Web3Status>,
        ) => {
            state.web3status = action.payload;
        },
        clearWeb3Status: (state) => {
            state.web3status = 'NOT_SELECTED';
        },
        setWeb3Error: (state, action: PayloadAction<boolean>) => {
            state.web3error = action.payload;
        },
        setCurrentChain: (state, action: PayloadAction<SupportedChainId>) => {
            state.currentChain = action.payload;
        },
    },
});

export default Web3Slice;
