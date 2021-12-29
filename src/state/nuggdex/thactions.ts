import { createAsyncThunk } from '@reduxjs/toolkit';

import {
    isUndefinedOrNullOrNotObject,
    isUndefinedOrNullOrStringEmpty,
} from '../../lib';
import myNuggsQuery from '../wallet/queries/myNuggsQuery';
import { nuggBare } from '../../graphql/fragments/nugg';

import getNuggThumbnailQuery from './queries/getNuggThumbnailQuery';
import activeNuggsQuery from './queries/activeNuggsQuery';
import allNuggsQuery from './queries/allNuggsQuery';

const getNuggThumbnail = createAsyncThunk<
    {
        success: NL.Redux.NuggDex.Success;
        data: NL.GraphQL.Fragments.Nugg.Thumbnail;
    },
    { id: string },
    { state: NL.Redux.RootState; rejectValue: NL.Redux.NuggDex.Error }
>('nuggdex/getNuggThumbnail', async ({ id }, thunkAPI) => {
    try {
        const res = await getNuggThumbnailQuery(id);

        return {
            success: 'GOT_THUMBNAIL',
            data: res,
        };
    } catch (err) {
        console.log(err);
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

const initNuggDex = createAsyncThunk<
    {
        success: NL.Redux.NuggDex.Success;
        data: {
            myNuggs: string[];
            activeNuggs: string[];
            allNuggs: string[];
        };
    },
    undefined,
    { state: NL.Redux.RootState; rejectValue: NL.Redux.NuggDex.Error }
>('nuggdex/initNuggDex', async (_, thunkAPI) => {
    try {
        const currentEpoch = thunkAPI.getState().protocol.epoch?.id || '0';

        const activeNuggs = (
            await activeNuggsQuery('id', 'desc', '', currentEpoch, 5, 0)
        ).map((val) => val.nugg.id);
        const allNuggs = (await allNuggsQuery('id', 'desc', '', 5, 0)).map(
            (swap) => swap.nugg.id,
        );
        console.log({ allNuggs });
        const myNuggs = (
            await myNuggsQuery(
                thunkAPI.getState().web3.web3address,
                'desc',
                '',
                5,
                0,
            )
        ).map((val) => val.id);

        return {
            success: 'GOT_THUMBNAIL',
            data: {
                activeNuggs,
                allNuggs,
                myNuggs,
            },
        };
    } catch (err) {
        console.log(err);
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
    getNuggThumbnail,
    initNuggDex,
};
