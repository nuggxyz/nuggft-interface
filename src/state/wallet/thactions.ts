import { createAsyncThunk } from '@reduxjs/toolkit';

import NuggFTHelper from '../../contracts/NuggFTHelper';
import {
    isUndefinedOrNullOrBooleanFalse,
    isUndefinedOrNullOrNotObject,
    isUndefinedOrNullOrNumberZero,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../lib';
import constants from '../../lib/constants';
import { Address } from '../../classes/Address';
import config from '../../config';
import Web3State from '../web3';
import AppState from '../app';

import userSharesQuery from './queries/userSharesQuery';

const getUserShares = createAsyncThunk<
    {
        success: NL.Redux.Wallet.Success;
        data: number;
    },
    undefined,
    // adding the root state type to this thaction causes a circular reference
    { rejectValue: NL.Redux.Wallet.Error }
>(`wallet/getUserShares`, async (_, thunkAPI) => {
    try {
        //@ts-ignore
        const id = thunkAPI.getState().web3.web3address;

        const res = await userSharesQuery(id);

        return {
            success: 'SUCCESS',
            data: !isUndefinedOrNullOrNumberZero(res) ? res : 0,
        };
    } catch (err) {
        console.log({ err });
        if (
            !isUndefinedOrNullOrNotObject(err) &&
            !isUndefinedOrNullOrNotObject(err.data) &&
            !isUndefinedOrNullOrStringEmpty(err.data.message)
        ) {
            const code = err.data.message.replace(
                'execution reverted: ',
                '',
            ) as NL.Redux.Wallet.Error;
            return thunkAPI.rejectWithValue(code);
        }
        return thunkAPI.rejectWithValue('ERROR_LINKING_ACCOUNT');
    }
});

const withdraw = createAsyncThunk<
    NL.Redux.Transaction.TxThunkSuccess<NL.Redux.Wallet.Success>,
    { tokenId: string },
    // adding the root state type to this thaction causes a circular reference
    { rejectValue: NL.Redux.Wallet.Error }
>(`wallet/withdraw`, async ({ tokenId }, thunkAPI) => {
    try {
        const _pendingtx = await NuggFTHelper.instance
            .connect(Web3State.getLibraryOrProvider())
            .burn(tokenId);

        return {
            success: 'SUCCESS',
            _pendingtx,
            callbackFn: () => AppState.dispatch.setModalClosed(),
        };
    } catch (err) {
        console.log({ err });
        if (
            !isUndefinedOrNullOrNotObject(err) &&
            !isUndefinedOrNullOrNotObject(err.data) &&
            !isUndefinedOrNullOrStringEmpty(err.data.message)
        ) {
            const code = err.data.message.replace(
                'execution reverted: ',
                '',
            ) as NL.Redux.Wallet.Error;
            return thunkAPI.rejectWithValue(code);
        }
        return thunkAPI.rejectWithValue('ERROR_LINKING_ACCOUNT');
    }
});

const approveNugg = createAsyncThunk<
    NL.Redux.Transaction.TxThunkSuccess<NL.Redux.Wallet.Success>,
    { tokenId: string },
    // adding the root state type to this thaction causes a circular reference
    { rejectValue: NL.Redux.Wallet.Error }
>(`wallet/approveNugg`, async ({ tokenId }, thunkAPI) => {
    try {
        const _pendingtx = await NuggFTHelper.approve(
            new Address(config.NUGGFT),
            tokenId,
        );

        return {
            success: 'SUCCESS',
            _pendingtx,
        };
    } catch (err) {
        console.log({ err });
        if (
            !isUndefinedOrNullOrNotObject(err) &&
            !isUndefinedOrNullOrNotObject(err.data) &&
            !isUndefinedOrNullOrStringEmpty(err.data.message)
        ) {
            const code = err.data.message.replace(
                'execution reverted: ',
                '',
            ) as NL.Redux.Wallet.Error;
            return thunkAPI.rejectWithValue(code);
        }
        return thunkAPI.rejectWithValue('ERROR_LINKING_ACCOUNT');
    }
});

const claim = createAsyncThunk<
    NL.Redux.Transaction.TxThunkSuccess<NL.Redux.Swap.Success>,
    { tokenId: string },
    // adding the root state type to this thaction causes a circular reference
    { rejectValue: NL.Redux.Wallet.Error }
>(`wallet/claim`, async ({ tokenId }, thunkAPI) => {
    try {
        const _pendingtx = await NuggFTHelper.instance
            .connect(Web3State.getLibraryOrProvider())
            //@ts-ignore
            .claim(thunkAPI.getState().web3.web3address, tokenId);

        return {
            success: 'SUCCESS',
            _pendingtx,
        };
    } catch (err) {
        console.log({ err });
        if (
            !isUndefinedOrNullOrNotObject(err) &&
            !isUndefinedOrNullOrNotObject(err.data) &&
            !isUndefinedOrNullOrStringEmpty(err.data.message)
        ) {
            const code = err.data.message.replace(
                'execution reverted: ',
                '',
            ) as NL.Redux.Wallet.Error;
            return thunkAPI.rejectWithValue(code);
        }
        return thunkAPI.rejectWithValue('ERROR_LINKING_ACCOUNT');
    }
});

const initLoan = createAsyncThunk<
    NL.Redux.Transaction.TxThunkSuccess<NL.Redux.Swap.Success>,
    { tokenId: string },
    // adding the root state type to this thaction causes a circular reference
    { rejectValue: NL.Redux.Wallet.Error }
>(`wallet/claim`, async ({ tokenId }, thunkAPI) => {
    try {
        const _pendingtx = await NuggFTHelper.instance
            .connect(Web3State.getLibraryOrProvider())
            .loan(tokenId);

        return {
            success: 'SUCCESS',
            _pendingtx,
            callbackFn: () => AppState.dispatch.setModalClosed(),
        };
    } catch (err) {
        console.log({ err });
        if (
            !isUndefinedOrNullOrNotObject(err) &&
            !isUndefinedOrNullOrNotObject(err.data) &&
            !isUndefinedOrNullOrStringEmpty(err.data.message)
        ) {
            const code = err.data.message.replace(
                'execution reverted: ',
                '',
            ) as NL.Redux.Wallet.Error;
            return thunkAPI.rejectWithValue(code);
        }
        return thunkAPI.rejectWithValue('ERROR_LINKING_ACCOUNT');
    }
});

export default {
    getUserShares,
    withdraw,
    claim,
    approveNugg,
    initLoan,
};
