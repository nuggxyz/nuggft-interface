import { createAsyncThunk } from '@reduxjs/toolkit';
import { BigNumberish } from 'ethers';

import NuggFTHelper from '../../contracts/NuggFTHelper';
import {
    isUndefinedOrNullOrNotObject,
    isUndefinedOrNullOrStringEmpty,
} from '../../lib';
import AppState from '../app';
import Web3State from '../web3';

const initSale = createAsyncThunk<
    NL.Redux.Transaction.TxThunkSuccess<NL.Redux.Wallet.Success>,
    { tokenId: string; floor: BigNumberish },
    { rejectValue: NL.Redux.Wallet.Error; state: NL.Redux.RootState }
>(`token/initSale`, async ({ tokenId, floor }, thunkAPI) => {
    try {
        const _pendingtx = await NuggFTHelper.instance
            .connect(Web3State.getLibraryOrProvider())
            .swap(tokenId, floor);

        return {
            success: 'SUCCESS',
            _pendingtx: _pendingtx.hash,
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
    initSale,
};
