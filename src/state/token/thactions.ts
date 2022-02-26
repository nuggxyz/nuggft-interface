import { Web3Provider } from '@ethersproject/providers';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { BigNumberish } from 'ethers';

import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import {
    isUndefinedOrNullOrNotObject,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '@src/lib';
import AppState from '@src/state/app';
import { SupportedChainId } from '@src/web3/config';

const initSale = createAsyncThunk<
    NL.Redux.Transaction.TxThunkSuccess<NL.Redux.Wallet.Success>,
    {
        tokenId: string;
        floor: BigNumberish;
        chainId: SupportedChainId;
        provider: Web3Provider;
        address: string;
    },
    { rejectValue: NL.Redux.Wallet.Error; state: NL.Redux.RootState }
>(`token/initSale`, async ({ tokenId, floor, chainId, provider, address }, thunkAPI) => {
    try {
        const _pendingtx = await new NuggftV1Helper(chainId, provider).contract
            .connect(provider.getSigner(address))
            ['sell(uint160,uint96)'](tokenId, floor);

        return {
            success: 'SUCCESS',
            _pendingtx: _pendingtx.hash,
            chainId,
            callbackFn: () => AppState.dispatch.setModalClosed(),
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
            ) as NL.Redux.Wallet.Error;
            return thunkAPI.rejectWithValue(code);
        }
        return thunkAPI.rejectWithValue('ERROR_LINKING_ACCOUNT');
    }
});

export default {
    initSale,
};
