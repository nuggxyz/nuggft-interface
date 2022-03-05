import { Web3Provider } from '@ethersproject/providers';
import { createAsyncThunk } from '@reduxjs/toolkit';

import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import { isUndefinedOrNullOrObjectEmpty, isUndefinedOrNullOrStringEmpty } from '@src/lib';
import { SupportedChainId } from '@src/web3/config';

import getIntervalQuery from './queries/getIntervalQuery';
import updateEpochQuery from './queries/updateEpochQuery';
import updateStakedQuery from './queries/updateStakedQuery';

const safeSetEpoch = createAsyncThunk<
    {
        success: NL.Redux.Protocol.Success;
        data?: {
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

        if (isUndefinedOrNullOrObjectEmpty(currentEpoch) || currentEpoch.id !== epoch.id) {
            return {
                success: 'SUCCESS',
                data: {
                    epoch,
                    isOver: false,
                    chainId,
                },
            };
        } else {
            return {
                success: 'SUCCESS',
            };
        }

        // if (
        //     !isUndefinedOrNullOrObjectEmpty(currentEpoch) &&
        //     !isUndefinedOrNullOrObjectEmpty(res) &&
        //     +currentEpoch.id !== +epoch.id &&
        //     +res.epoch.id === +epoch.id
        // ) {
        //     return {
        //         success: 'SUCCESS',
        //         data: {
        //             epoch: res.epoch,
        //             isOver: true,
        //             chainId,
        //         },
        //     };
        // } else {
        //     return {
        //         success: 'SUCCESS',
        //         data: {
        //             epoch,
        //             isOver: false,
        //             chainId,
        //         },
        //     };
        // }
    } catch (error) {
        console.log('protocol/safeSetEpoch', error);
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

const getGenesisBlock = createAsyncThunk<
    {
        success: NL.Redux.Protocol.Success;
        data: string;
    },
    { chainId: SupportedChainId; provider: Web3Provider },
    {
        rejectValue: NL.Redux.Protocol.Error;
    }
>('protocol/getGenesisBlock', async ({ chainId, provider }, thunkAPI) => {
    try {
        const res = await new NuggftV1Helper(chainId, provider).contract.genesis();

        if (!isUndefinedOrNullOrObjectEmpty(res)) {
            return {
                data: res.toString(),
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

const getInterval = createAsyncThunk<
    {
        success: NL.Redux.Protocol.Success;
        data: string;
    },
    { chainId: SupportedChainId },
    {
        rejectValue: NL.Redux.Protocol.Error;
    }
>('protocol/getInterval', async ({ chainId }, thunkAPI) => {
    try {
        const res = await getIntervalQuery(chainId);
        console.log(res);

        if (!isUndefinedOrNullOrStringEmpty(res)) {
            return {
                data: res,
                success: 'SUCCESS',
            };
        }
        console.log('protocol/getInterval');
        return thunkAPI.rejectWithValue('UNKNOWN');
    } catch (error) {
        console.log('protocol/getInterval', error);
        return thunkAPI.rejectWithValue('UNKNOWN');
    }
});

export default {
    updateStaked,
    safeSetEpoch,
    getGenesisBlock,
    getInterval,
};
