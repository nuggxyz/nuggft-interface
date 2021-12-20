import { createAsyncThunk } from '@reduxjs/toolkit';

import NuggFTHelper from '../../contracts/NuggFTHelper';
import {
    isUndefinedOrNullOrNotObject,
    isUndefinedOrNullOrStringEmpty,
} from '../../lib';

const initSale = createAsyncThunk<
    NL.Redux.Transaction.TxThunkSuccess<NL.Redux.Wallet.Success>,
    { tokenId: string },
    { rejectValue: NL.Redux.Wallet.Error; state: NL.Redux.RootState }
>(`token/initSale`, async ({ tokenId }, thunkAPI) => {
    try {
        const floor = thunkAPI.getState().protocol.nuggftStakedEthPerShare;
        const _pendingtx = await NuggFTHelper.instance.swap(tokenId, floor);

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

export default {
    initSale,
};
