import invariant from 'tiny-invariant';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { BigNumber } from 'ethers';

import {
    isUndefinedOrNullOrNotObject,
    isUndefinedOrNullOrStringEmpty,
} from '../../lib';
import { toEth } from '../../lib/conversion';
import NuggFTHelper from '../../contracts/NuggFTHelper';
import AppState from '../app';

import initSwapQuery from './queries/initSwapQuery';
import pollOffersQuery from './queries/pollOffersQuery';

const initSwap = createAsyncThunk<
    {
        success: NL.Redux.Swap.Success;
        data: NL.GraphQL.Fragments.Swap.Bare;
    },
    { swapId: string },
    { rejectValue: NL.Redux.Swap.Error; state: NL.Redux.RootState }
>('swap/initSwap', async ({ swapId }, thunkAPI) => {
    try {
        invariant(swapId, 'swap id passed as undefined');
        let res = await initSwapQuery(swapId);
        return {
            success: 'SUCCESS',
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
});

const pollOffers = createAsyncThunk<
    {
        success: NL.Redux.Swap.Success;
        data: NL.GraphQL.Fragments.Offer.Bare[];
    },
    { swapId: string },
    { rejectValue: NL.Redux.Swap.Error; state: NL.Redux.RootState }
>('swap/pollOffers', async ({ swapId }, thunkAPI) => {
    try {
        invariant(swapId, 'swap id passed as undefined');
        let res = await pollOffersQuery(swapId);
        return {
            success: 'SUCCESS',
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
});

const placeOffer = createAsyncThunk<
    NL.Redux.Transaction.TxThunkSuccess<NL.Redux.Swap.Success>,
    { amount: string; tokenId: string },
    { rejectValue: NL.Redux.Swap.Error; state: NL.Redux.RootState }
>('swap/placeOffer', async ({ amount, tokenId }, thunkAPI) => {
    try {
        const _pendingtx = await NuggFTHelper.instance.delegate(
            BigNumber.from(tokenId),
            { value: toEth(amount) },
        );

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
            ) as NL.Redux.Token.Error;
            return thunkAPI.rejectWithValue(code);
        }
        return thunkAPI.rejectWithValue('UNKNOWN');
    }
});

export default {
    initSwap,
    placeOffer,
    pollOffers,
};
