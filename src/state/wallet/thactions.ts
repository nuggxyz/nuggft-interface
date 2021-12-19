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

import historyQuery from './queries/historyQuery';
import unclaimedOffersQuery from './queries/unclaimedOffersQuery';
import userSharesQuery from './queries/userSharesQuery';

import WalletState from '.';

const getUnclaimedOffers = createAsyncThunk<
    {
        success: NL.Redux.Wallet.Success;
        data: NL.GraphQL.Fragments.Offer.Thumbnail[];
    },
    undefined,
    // adding the root state type to this thaction causes a circular reference
    { rejectValue: NL.Redux.Wallet.Error }
>(`wallet/getUnclaimedOffers`, async (_, thunkAPI) => {
    try {
        //@ts-ignore
        const id = thunkAPI.getState().web3.web3address;
        const epoch = !isUndefinedOrNullOrObjectEmpty(
            //@ts-ignore
            thunkAPI.getState().protocol.epoch,
        )
            ? //@ts-ignore
              thunkAPI.getState().protocol.epoch.id
            : '';

        const res = await unclaimedOffersQuery(id, epoch);

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
            ) as NL.Redux.Wallet.Error;
            return thunkAPI.rejectWithValue(code);
        }
        return thunkAPI.rejectWithValue('ERROR_LINKING_ACCOUNT');
    }
});

const getHistory = createAsyncThunk<
    {
        success: NL.Redux.Wallet.Success;
        data: NL.GraphQL.Fragments.Offer.Thumbnail[];
    },
    { addToResult?: boolean },
    // adding the root state type to this thaction causes a circular reference
    { rejectValue: NL.Redux.Wallet.Error }
>(`wallet/getHistory`, async ({ addToResult }, thunkAPI) => {
    try {
        //@ts-ignore
        const id = thunkAPI.getState().web3.web3address;
        //@ts-ignore
        const previousResults = thunkAPI.getState().wallet.history;

        let res = !isUndefinedOrNullOrBooleanFalse(addToResult)
            ? previousResults
            : [];

        const history = await historyQuery(
            id,
            constants.NUGGDEX_SEARCH_LIST_CHUNK,
            res.length,
        );

        res.push(...history);

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
            ) as NL.Redux.Wallet.Error;
            return thunkAPI.rejectWithValue(code);
        }
        return thunkAPI.rejectWithValue('ERROR_LINKING_ACCOUNT');
    }
});

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
        const _pendingtx = await NuggFTHelper.instance.burn(tokenId);

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

const approveNugg = createAsyncThunk<
    NL.Redux.Transaction.TxThunkSuccess<NL.Redux.Wallet.Success>,
    { tokenId: string },
    // adding the root state type to this thaction causes a circular reference
    { rejectValue: NL.Redux.Wallet.Error }
>(`wallet/approveNugg`, async ({ tokenId }, thunkAPI) => {
    try {
        const _pendingtx = await NuggFTHelper.approve(
            new Address(config.GATSBY_NUGGFT),
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
    { tokenId: string; endingEpoch: string },
    // adding the root state type to this thaction causes a circular reference
    { rejectValue: NL.Redux.Wallet.Error }
>(`wallet/claim`, async ({ tokenId, endingEpoch }, thunkAPI) => {
    try {
        const _pendingtx = await NuggFTHelper.instance.claim(
            tokenId,
            endingEpoch,
        );

        return {
            success: 'SUCCESS',
            _pendingtx,
            callbackFn: () => {
                WalletState.dispatch.getUnclaimedOffers();
                WalletState.dispatch.getHistory({});
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
            ) as NL.Redux.Wallet.Error;
            return thunkAPI.rejectWithValue(code);
        }
        return thunkAPI.rejectWithValue('ERROR_LINKING_ACCOUNT');
    }
});

export default {
    getUnclaimedOffers,
    getUserShares,
    getHistory,
    withdraw,
    claim,
    approveNugg,
};
