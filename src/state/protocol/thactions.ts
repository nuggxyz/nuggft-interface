import { createAsyncThunk } from '@reduxjs/toolkit';

import updateActivesQuery from './queries/updateActivesQuery';
import updateBlockQuery from './queries/updateBlockQuery';
import updateEpochQuery from './queries/updateEpochQuery';
import updatePricesQuery from './queries/updatePricesQuery';
import updateProtocolQuery from './queries/updateProtocolQuery';
import updateStakedQuery from './queries/updateStakedQuery';
import updateTotalsQuery from './queries/updateTotalsQuery';
import updateUsersQuery from './queries/updateUsersQuery';

const updateProtocol = createAsyncThunk<
    {
        success: NL.Redux.Protocol.Success;
        data: NL.GraphQL.Fragments.Protocol.Full;
    },
    undefined,
    {
        rejectValue: NL.Redux.Protocol.Error;
    }
>('protocol/updateProtocol', async (_, thunkAPI) => {
    try {
        const res = await updateProtocolQuery();

        return {
            data: res,
            success: 'SUCCESS',
        };
    } catch (error) {
        console.log('protocol/updateProtocol', error);
        return thunkAPI.rejectWithValue('UNKNOWN');
    }
});

const updateEpoch = createAsyncThunk<
    {
        success: NL.Redux.Protocol.Success;
        data: NL.GraphQL.Fragments.Protocol.Epochs;
    },
    undefined,
    {
        rejectValue: NL.Redux.Protocol.Error;
    }
>('protocol/updateEpoch', async (_, thunkAPI) => {
    try {
        const res = await updateEpochQuery();
        return {
            data: res,
            success: 'SUCCESS',
        };
    } catch (error) {
        console.log('protocol/updateEpoch', error);
        return thunkAPI.rejectWithValue('UNKNOWN');
    }
});

const updatePrices = createAsyncThunk<
    {
        success: NL.Redux.Protocol.Success;
        data: NL.GraphQL.Fragments.Protocol.Prices;
    },
    undefined,
    {
        rejectValue: NL.Redux.Protocol.Error;
    }
>('protocol/updatePrices', async (_, thunkAPI) => {
    try {
        const res = await updatePricesQuery();

        return {
            data: res,
            success: 'SUCCESS',
        };
    } catch (error) {
        console.log('protocol/updatePrices', error);
        return thunkAPI.rejectWithValue('UNKNOWN');
    }
});

const updateActives = createAsyncThunk<
    {
        success: NL.Redux.Protocol.Success;
        data: NL.GraphQL.Fragments.Protocol.Actives;
    },
    undefined,
    {
        rejectValue: NL.Redux.Protocol.Error;
    }
>('protocol/updateActives', async (_, thunkAPI) => {
    try {
        const res = await updateActivesQuery();

        return {
            data: res,
            success: 'SUCCESS',
        };
    } catch (error) {
        console.log('protocol/updateActives', error);
        return thunkAPI.rejectWithValue('UNKNOWN');
    }
});

const updateTotals = createAsyncThunk<
    {
        success: NL.Redux.Protocol.Success;
        data: NL.GraphQL.Fragments.Protocol.Totals;
    },
    undefined,
    {
        rejectValue: NL.Redux.Protocol.Error;
    }
>('protocol/updateTotals', async (_, thunkAPI) => {
    try {
        const res = await updateTotalsQuery();

        return {
            data: res,
            success: 'SUCCESS',
        };
    } catch (error) {
        console.log('protocol/updateTotals', error);
        return thunkAPI.rejectWithValue('UNKNOWN');
    }
});

const updateUsers = createAsyncThunk<
    {
        success: NL.Redux.Protocol.Success;
        data: NL.GraphQL.Fragments.Protocol.Users;
    },
    undefined,
    {
        rejectValue: NL.Redux.Protocol.Error;
    }
>('protocol/updateUsersQuery', async (_, thunkAPI) => {
    try {
        const res = await updateUsersQuery();

        return {
            data: res,
            success: 'SUCCESS',
        };
    } catch (error) {
        console.log('protocol/updateUsersQuery', error);
        return thunkAPI.rejectWithValue('UNKNOWN');
    }
});

const updateStaked = createAsyncThunk<
    {
        success: NL.Redux.Protocol.Success;
        data: NL.GraphQL.Fragments.Protocol.Staked;
    },
    undefined,
    {
        rejectValue: NL.Redux.Protocol.Error;
    }
>('protocol/updateStaked', async (_, thunkAPI) => {
    try {
        const res = await updateStakedQuery();

        return {
            data: res,
            success: 'SUCCESS',
        };
    } catch (error) {
        console.log('protocol/updateStakedQuery', error);
        return thunkAPI.rejectWithValue('UNKNOWN');
    }
});

const updateBlock = createAsyncThunk<
    {
        success: NL.Redux.Protocol.Success;
        data: number;
    },
    undefined,
    {
        rejectValue: NL.Redux.Protocol.Error;
    }
>('protocol/updateBlock', async (_, thunkAPI) => {
    try {
        const res = await updateBlockQuery();

        return {
            data: res.block.number,
            success: 'SUCCESS',
        };
    } catch (error) {
        console.log('protocol/updateBlock', error);
        return thunkAPI.rejectWithValue('UNKNOWN');
    }
});

export default {
    updateProtocol,
    updateEpoch,
    updatePrices,
    updateActives,
    updateTotals,
    updateUsers,
    updateStaked,
    updateBlock,
};
