import { createAsyncThunk } from '@reduxjs/toolkit';

import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrBooleanFalse,
    isUndefinedOrNullOrNotObject,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../lib';
import constants from '../../lib/constants';

import myNuggsQuery from './queries/myNuggsQuery';
import getNuggThumbnailQuery from './queries/getNuggThumbnailQuery';
import activeNuggsQuery from './queries/activeNuggsQuery';
import allNuggsQuery from './queries/allNuggsQuery';

const searchTokens = createAsyncThunk<
    {
        success: NL.Redux.NuggDex.Success;
        data: string[];
    },
    { filters: NL.Redux.NuggDex.Filters; addToResult?: boolean },
    { state: NL.Redux.RootState; rejectValue: NL.Redux.NuggDex.Error }
>('nuggdex/searchTokens', async ({ filters, addToResult }, thunkAPI) => {
    try {
        let previousResults = thunkAPI.getState().nuggdex.searchResults;
        let res = !isUndefinedOrNullOrBooleanFalse(addToResult)
            ? previousResults
            : [];
        const viewing = thunkAPI.getState().nuggdex.viewing;

        if (!isUndefinedOrNullOrObjectEmpty(filters)) {
            if (viewing === 'recently viewed') {
                const recentsCopy = Object.assign(
                    [],
                    thunkAPI.getState().nuggdex.recents,
                );

                recentsCopy
                    .sort((a, b) => (+a > +b && filters.sort.asc ? 1 : -1))
                    .filter(
                        (id) =>
                            isUndefinedOrNullOrStringEmpty(
                                filters.searchValue,
                            ) || id.includes(filters.searchValue),
                    );
                res = recentsCopy;
            } else {
                if (viewing === 'on sale') {
                    const currentEpoch = thunkAPI.getState().protocol.epoch.id;
                    const activeNuggs = await activeNuggsQuery(
                        filters.sort.by,
                        filters.sort.asc ? 'asc' : 'desc',
                        filters.searchValue,
                        currentEpoch,
                        constants.NUGGDEX_SEARCH_LIST_CHUNK,
                        res.length,
                    );

                    if (!isUndefinedOrNullOrArrayEmpty(activeNuggs)) {
                        res = [
                            ...res,
                            ...activeNuggs.map((active) => active.nugg.id),
                        ];
                    }
                } else if (viewing === 'all nuggs') {
                    const allNuggs = (
                        await allNuggsQuery(
                            filters.sort.by,
                            filters.sort.asc ? 'asc' : 'desc',
                            filters.searchValue,
                            constants.NUGGDEX_SEARCH_LIST_CHUNK,
                            res.length,
                        )
                    ).reduce((map, all) => {
                        map[all.nugg.id] = all.nugg.id;
                        return map;
                        //@ts-ignore
                    }, {});

                    res = [...res, ...Object.keys(allNuggs)];
                } else if (viewing === 'my nuggs') {
                    const myNuggs = await myNuggsQuery(
                        thunkAPI.getState().web3.web3address,
                        filters.sort.asc ? 'asc' : 'desc',
                        filters.searchValue,
                        constants.NUGGDEX_SEARCH_LIST_CHUNK,
                        res.length,
                    );

                    if (!isUndefinedOrNullOrArrayEmpty(myNuggs)) {
                        res = [...res, ...myNuggs.map((my) => my.id)];
                    }
                }
            }
        }

        return {
            success: 'QUERIED_TOKENS_ON_SALE',
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
        const currentEpoch = thunkAPI.getState().protocol.epoch.id;

        const activeNuggs = (
            await activeNuggsQuery('id', 'desc', '', currentEpoch, 5, 0)
        ).map((val) => val.nugg.id);
        const allNuggs = Object.keys(
            await allNuggsQuery('id', 'desc', '', 5, 0),
        );
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

const NuggDexThactions = {
    getNuggThumbnail,
    searchTokens,
    initNuggDex,
};

export default NuggDexThactions;
