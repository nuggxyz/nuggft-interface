import invariant from 'tiny-invariant';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { BigNumber } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';

import {
    isUndefinedOrNullOrNotObject,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '@src/lib';
import { toEth } from '@src/lib/conversion';
import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import AppState from '@src/state/app';
import { SupportedChainId } from '@src/web3/config';

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
    { swapId: string; chainId: SupportedChainId },
    { rejectValue: NL.Redux.Swap.Error; state: NL.Redux.RootState }
>('swap/initSwap', async ({ swapId, chainId }, thunkAPI) => {
    const currentEpoch = thunkAPI.getState().protocol.epoch;
    try {
        invariant(swapId, 'swap id passed as undefined');
        const res = await initSwapQuery(chainId, swapId);
        if (!isUndefinedOrNullOrObjectEmpty(res)) {
            const status =
                res.endingEpoch === null
                    ? 'waiting'
                    : currentEpoch && +res.endingEpoch >= +currentEpoch.id
                    ? 'ongoing'
                    : 'over';
            return {
                success: 'SUCCESS',
                data: { swap: res, status },
            };
        } else {
            if (currentEpoch && !swapId.includes(currentEpoch.id)) {
                AppState.onRouteUpdate(chainId, '/');
            }
            return thunkAPI.rejectWithValue('UNKNOWN');
        }
    } catch (err) {
        console.log({ err });
        if (currentEpoch && !swapId.includes(currentEpoch.id)) {
            AppState.onRouteUpdate(chainId, '/');
        }
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
        data: { offers: NL.GraphQL.Fragments.Offer.Bare[]; swapId: string };
    },
    { swapId: string; chainId: SupportedChainId },
    { rejectValue: NL.Redux.Swap.Error; state: NL.Redux.RootState }
>('swap/pollOffers', async ({ chainId, swapId }, thunkAPI) => {
    try {
        invariant(swapId, 'swap id passed as undefined');
        let res = await pollOffersQuery(chainId, swapId);
        return {
            success: 'SUCCESS',
            data: { offers: res, swapId },
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
    { amount: string; tokenId: string; provider: Web3Provider; chainId: SupportedChainId },
    { rejectValue: NL.Redux.Swap.Error; state: NL.Redux.RootState }
>('swap/placeOffer', async ({ amount, tokenId, provider, chainId }, thunkAPI) => {
    try {
        const _pendingtx = await new NuggftV1Helper(chainId, provider).contract[
            // .connect(Web3State.getSignerOrProvider())
            'offer(uint160)'
        ](BigNumber.from(tokenId), {
            value: toEth(amount),
        });

        return {
            success: 'SUCCESS',
            _pendingtx: _pendingtx.hash,
            callbackFn: () => {
                AppState.dispatch.setModalClosed();
            },
        };
    } catch (err) {
        console.log({ err });
        if (
            !isUndefinedOrNullOrObjectEmpty(err) &&
            !isUndefinedOrNullOrStringEmpty(err.method) &&
            err.method === 'estimateGas'
        ) {
            return thunkAPI.rejectWithValue('GAS_ERROR');
        }
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
