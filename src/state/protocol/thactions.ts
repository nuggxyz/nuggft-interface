import { Web3Provider } from '@ethersproject/providers';
import { createAsyncThunk } from '@reduxjs/toolkit';

import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import { isUndefinedOrNullOrObjectEmpty } from '@src/lib';
import { SupportedChainId } from '@src/web3/config';

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
    { chainId: SupportedChainId },
    {
        rejectValue: NL.Redux.Protocol.Error;
    }
>('protocol/updateProtocol', async ({ chainId }, thunkAPI) => {
    try {
        const res = await updateProtocolQuery(chainId);

        return {
            data: res,
            success: 'SUCCESS',
        };
    } catch (error) {
        console.log('protocol/updateProtocol', error);
        return thunkAPI.rejectWithValue('UNKNOWN');
    }
});

const safeSetEpoch = createAsyncThunk<
    {
        success: NL.Redux.Protocol.Success;
        data: {
            epoch: { id: string; startblock: string; endblock: string };
            isOver: boolean;
            chainId: SupportedChainId;
        };
    },
    { epoch: { id: string; startblock: string; endblock: string }; chainId: SupportedChainId },
    {
        rejectValue: NL.Redux.Protocol.Error;
    }
>('protocol/safeSetEpoch', async ({ epoch, chainId }, thunkAPI) => {
    try {
        const res = await updateEpochQuery(chainId);
        //@ts-ignore
        const currentEpoch = thunkAPI.getState().protocol.epoch;

        if (
            !isUndefinedOrNullOrObjectEmpty(currentEpoch) &&
            !isUndefinedOrNullOrObjectEmpty(res) &&
            +currentEpoch.id !== +epoch.id &&
            +res.epoch.id === +epoch.id
        ) {
            return {
                success: 'SUCCESS',
                data: {
                    epoch: res.epoch,
                    isOver: true,
                    chainId,
                },
            };
        } else {
            return {
                success: 'SUCCESS',
                data: {
                    epoch,
                    isOver: false,
                    chainId,
                },
            };
        }
    } catch (error) {
        console.log('protocol/safeSetEpoch', error);
        return thunkAPI.rejectWithValue('UNKNOWN');
    }
});

// const updateEpoch = createAsyncThunk<
//     {
//         success: NL.Redux.Protocol.Success;
//         data: NL.GraphQL.Fragments.Protocol.Epochs;
//     },
//     undefined,
//     {
//         rejectValue: NL.Redux.Protocol.Error;
//     }
// >('protocol/updateEpoch', async (_, thunkAPI) => {
//     try {
//         const res = await updateEpochQuery();
//         return {
//             data: res,
//             success: 'SUCCESS',
//         };
//     } catch (error) {
//         console.log('protocol/updateEpoch', error);
//         return thunkAPI.rejectWithValue('UNKNOWN');
//     }
// });

const updatePrices = createAsyncThunk<
    {
        success: NL.Redux.Protocol.Success;
        data: NL.GraphQL.Fragments.Protocol.Prices;
    },
    { chainId: SupportedChainId },
    {
        rejectValue: NL.Redux.Protocol.Error;
    }
>('protocol/updatePrices', async ({ chainId }, thunkAPI) => {
    try {
        const res = await updatePricesQuery(chainId);

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
    { chainId: SupportedChainId },
    {
        rejectValue: NL.Redux.Protocol.Error;
    }
>('protocol/updateActives', async ({ chainId }, thunkAPI) => {
    try {
        const res = await updateActivesQuery(chainId);

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
    { chainId: SupportedChainId },
    {
        rejectValue: NL.Redux.Protocol.Error;
    }
>('protocol/updateTotals', async ({ chainId }, thunkAPI) => {
    try {
        const res = await updateTotalsQuery(chainId);

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
    { chainId: SupportedChainId },
    {
        rejectValue: NL.Redux.Protocol.Error;
    }
>('protocol/updateUsersQuery', async ({ chainId }, thunkAPI) => {
    try {
        const res = await updateUsersQuery(chainId);

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
    { chainId: SupportedChainId },
    {
        rejectValue: NL.Redux.Protocol.Error;
    }
>('protocol/updateStaked', async ({ chainId }, thunkAPI) => {
    try {
        const res = await updateStakedQuery(chainId);

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
    { chainId: SupportedChainId },
    {
        rejectValue: NL.Redux.Protocol.Error;
    }
>('protocol/updateBlock', async ({ chainId }, thunkAPI) => {
    try {
        const res = await updateBlockQuery(chainId);

        return {
            data: res.block.number,
            success: 'SUCCESS',
        };
    } catch (error) {
        console.log('protocol/updateBlock', error);
        return thunkAPI.rejectWithValue('UNKNOWN');
    }
});

const getGenesisBlock = createAsyncThunk<
    {
        success: NL.Redux.Protocol.Success;
        data: number;
    },
    { chainId: SupportedChainId; provider: Web3Provider },
    {
        rejectValue: NL.Redux.Protocol.Error;
    }
>('protocol/getGenesisBlock', async ({ chainId, provider }, thunkAPI) => {
    try {
        const res = await new NuggftV1Helper(chainId, provider).contract
            // .connect(Web3State.getSignerOrProvider())
            .genesis();

        if (!isUndefinedOrNullOrObjectEmpty(res)) {
            return {
                data: res.toNumber(),
                success: 'SUCCESS',
            };
        }
        if (!window.web3) {
            setTimeout(() => window.location.reload(), 1000);
        }
        console.log('protocol/getGenesisBlock');
        return thunkAPI.rejectWithValue('UNKNOWN');
    } catch (error) {
        console.log('protocol/getGenesisBlock', error);
        return thunkAPI.rejectWithValue('UNKNOWN');
    }
});

export default {
    updateProtocol,
    // updateEpoch,
    updatePrices,
    updateActives,
    updateTotals,
    updateUsers,
    updateStaked,
    updateBlock,
    safeSetEpoch,
    getGenesisBlock,
};
