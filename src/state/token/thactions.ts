import { createAsyncThunk } from '@reduxjs/toolkit';

import NuggFTHelper from '../../contracts/NuggFTHelper';
import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrBooleanFalse,
    isUndefinedOrNullOrNotObject,
    isUndefinedOrNullOrStringEmpty,
} from '../../lib';
import constants from '../../lib/constants';

import swapHistoryQuery from './queries/swapHistoryQuery';

const getSwapHistory = createAsyncThunk<
    {
        success: NL.Redux.Token.Success;
        data: NL.GraphQL.Fragments.Swap.Thumbnail[];
    },
    { tokenId: string; addToResult?: boolean; direction?: 'asc' | 'desc' },
    { state: NL.Redux.RootState; rejectValue: NL.Redux.Token.Error }
>(
    'token/getSwapHistory',
    async ({ tokenId, addToResult, direction = 'asc' }, thunkAPI) => {
        try {
            let previousSwaps = thunkAPI.getState().token.swaps;
            let res =
                !isUndefinedOrNullOrArrayEmpty(previousSwaps) &&
                !isUndefinedOrNullOrBooleanFalse(addToResult)
                    ? previousSwaps
                    : [];

            const history = await swapHistoryQuery(
                tokenId,
                direction,
                constants.NUGGDEX_SEARCH_LIST_CHUNK,
                res.length,
            );

            res.push(...history);

            return {
                success: 'GOT_SWAP_HISTORY',
                data: res,
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
                ) as NL.Redux.Token.Error;
                return thunkAPI.rejectWithValue(code);
            }
            return thunkAPI.rejectWithValue('UNKNOWN');
        }
    },
);

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
    getSwapHistory,
};
