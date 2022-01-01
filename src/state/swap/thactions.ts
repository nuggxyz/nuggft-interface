import invariant from 'tiny-invariant';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { BigNumber, Contract } from 'ethers';

import {
    isUndefinedOrNullOrNotObject,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../lib';
import { toEth } from '../../lib/conversion';
import NuggFTHelper from '../../contracts/NuggFTHelper';
import AppState from '../app';
import Web3State from '../web3';

import pollOffersQuery from './queries/pollOffersQuery';
import initSwapQuery from './queries/initSwapQuery';

const initSwap = createAsyncThunk<
    {
        success: NL.Redux.Swap.Success;
        data: {
            swap: NL.GraphQL.Fragments.Swap.Bare;
            status: NL.Redux.Swap.Status;
        };
    },
    { swapId: string },
    { rejectValue: NL.Redux.Swap.Error; state: NL.Redux.RootState }
>('swap/initSwap', async ({ swapId }, thunkAPI) => {
    try {
        invariant(swapId, 'swap id passed as undefined');
        const res = await initSwapQuery(swapId);
        if (!isUndefinedOrNullOrObjectEmpty(res)) {
            const currentEpoch = thunkAPI.getState().protocol.epoch;
            const status =
                res.endingEpoch === null
                    ? 'waiting'
                    : currentEpoch && res.endingEpoch >= +currentEpoch.id
                    ? 'ongoing'
                    : 'over';
            return {
                success: 'SUCCESS',
                data: { swap: res, status },
            };
        } else {
            AppState.onRouteUpdate('/');
            return thunkAPI.rejectWithValue('UNKNOWN');
        }
    } catch (err) {
        console.log({ err });
        AppState.onRouteUpdate('/');
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
        //@ts-ignore
        const swapStatus = thunkAPI.getState().swap.status;
        //@ts-ignore
        const epoch = thunkAPI.getState().protocol.epoch?.id;

        const _pendingtx = await NuggFTHelper.instance
            .connect(Web3State.getLibraryOrProvider())
            .delegate(
                thunkAPI.getState().web3.web3address,
                BigNumber.from(tokenId),
                { value: toEth(amount) },
            );

        return {
            success: 'SUCCESS',
            _pendingtx,
            callbackFn: () => {
                AppState.dispatch.setModalClosed();
            },
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
