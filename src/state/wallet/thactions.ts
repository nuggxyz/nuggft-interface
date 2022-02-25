import { createAsyncThunk } from '@reduxjs/toolkit';
import gql from 'graphql-tag';
import { Web3Provider } from '@ethersproject/providers';

import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrNotObject,
    isUndefinedOrNullOrNumberZero,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '@src/lib';
import constants from '@src/lib/constants';
import AppState from '@src/state/app';
import { toEth } from '@src/lib/conversion';
import { executeQuery } from '@src/graphql/helpers';
import { SupportedChainId } from '@src/web3/config';

import userSharesQuery from './queries/userSharesQuery';

const getUserShares = createAsyncThunk<
    {
        success: NL.Redux.Wallet.Success;
        data: number;
    },
    { chainId: SupportedChainId; address: string },
    // adding the root state type to this thaction causes a circular reference
    { rejectValue: NL.Redux.Wallet.Error }
>(`wallet/getUserShares`, async ({ chainId, address }, thunkAPI) => {
    try {
        //@ts-ignore
        const id = address;

        const res = await userSharesQuery(chainId, id);

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
    { tokenId: string; provider: Web3Provider; chainId: SupportedChainId },
    // adding the root state type to this thaction causes a circular reference
    { rejectValue: NL.Redux.Wallet.Error }
>(`wallet/withdraw`, async ({ tokenId, provider, chainId }, thunkAPI) => {
    try {
        const _pendingtx = await new NuggftV1Helper(chainId, provider).contract
            // .connect(Web3State.getSignerOrProvider())
            .burn(tokenId);
        return {
            success: 'SUCCESS',
            _pendingtx: _pendingtx.hash,
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
            ) as NL.Redux.Wallet.Error;
            return thunkAPI.rejectWithValue(code);
        }
        return thunkAPI.rejectWithValue('ERROR_LINKING_ACCOUNT');
    }
});

const claim = createAsyncThunk<
    NL.Redux.Transaction.TxThunkSuccess<NL.Redux.Swap.Success>,
    { tokenId: string; provider: Web3Provider; chainId: SupportedChainId },
    // adding the root state type to this thaction causes a circular reference
    { rejectValue: NL.Redux.Wallet.Error }
>(`wallet/claim`, async ({ tokenId, provider, chainId }, thunkAPI) => {
    try {
        //@ts-ignore
        const addr = thunkAPI.getState().web3.web3address;

        const _pendingtx = await new NuggftV1Helper(chainId, provider).contract[
            // .connect(Web3State.getSignerOrProvider())
            'claim(uint160[],address[])'
        ]([tokenId], [addr]);
        return {
            success: 'SUCCESS',
            _pendingtx: _pendingtx.hash,
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

const multiClaim = createAsyncThunk<
    NL.Redux.Transaction.TxThunkSuccess<NL.Redux.Swap.Success>,
    { tokenIds: string[]; provider: Web3Provider; chainId: SupportedChainId; address: string },
    // adding the root state type to this thaction causes a circular reference
    { rejectValue: NL.Redux.Wallet.Error }
>(`wallet/multiClaim`, async ({ tokenIds, provider, chainId, address }, thunkAPI) => {
    try {
        //@ts-ignore
        const addr = thunkAPI.getState().web3.web3address;

        const _pendingtx = await new NuggftV1Helper(chainId, provider).contract
            .connect(provider.getSigner(address))
            [
                // .connect(Web3State.getSignerOrProvider())
                'claim(uint160[],address[])'
            ](tokenIds, new Array(tokenIds.length).fill(addr), {
                gasLimit: 500000,
            });
        return {
            success: 'SUCCESS',
            _pendingtx: _pendingtx.hash,
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

const mintNugg = createAsyncThunk<
    NL.Redux.Transaction.TxThunkSuccess<NL.Redux.Swap.Success>,
    { chainId: SupportedChainId; provider: Web3Provider; address: string },
    // adding the root state type to this thaction causes a circular reference
    { rejectValue: NL.Redux.Wallet.Error }
>(`wallet/mintNugg`, async ({ chainId, provider, address }, thunkAPI) => {
    try {
        const latestNugg = await executeQuery(
            chainId,
            gql`
            {
                nuggs(
                    where: {
                        idnum_gt: ${constants.PRE_MINT_STARTING_EPOCH}
                        idnum_lt: ${constants.PRE_MINT_ENDING_EPOCH}
                    }
                    first: 1
                    orderDirection: desc
                    orderBy: idnum
                ) {
                    idnum
                }
            }
        `,
            'nuggs',
        );

        const nuggPrice = await new NuggftV1Helper(chainId, provider).contract
            // .connect(Web3State.getSignerOrProvider())
            .msp();

        if (
            isUndefinedOrNullOrArrayEmpty(latestNugg) ||
            (!isUndefinedOrNullOrArrayEmpty(latestNugg) &&
                !isUndefinedOrNullOrStringEmpty(latestNugg[0].idnum) &&
                +latestNugg[0].idnum + 1 < constants.PRE_MINT_ENDING_EPOCH)
        ) {
            const nuggToMint = isUndefinedOrNullOrArrayEmpty(latestNugg)
                ? constants.PRE_MINT_STARTING_EPOCH + 1
                : +latestNugg[0].idnum + 1;
            const _pendingtx = await new NuggftV1Helper(chainId, provider).contract
                .connect(provider.getSigner(address))
                // .connect(Web3State.getSignerOrProvider())
                .mint(nuggToMint, {
                    value: nuggPrice,
                });
            return {
                success: 'SUCCESS',
                _pendingtx: _pendingtx.hash,
            };
        }
        return thunkAPI.rejectWithValue('NO_NUGGS_TO_MINT');
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

const initLoan = createAsyncThunk<
    NL.Redux.Transaction.TxThunkSuccess<NL.Redux.Swap.Success>,
    { tokenId: string; provider: Web3Provider; chainId: SupportedChainId },
    // adding the root state type to this thaction causes a circular reference
    { rejectValue: NL.Redux.Wallet.Error }
>(`wallet/initLoan`, async ({ tokenId, provider, chainId }, thunkAPI) => {
    try {
        const _pendingtx = await new NuggftV1Helper(chainId, provider).contract
            // .connect(Web3State.getSignerOrProvider())
            .loan([tokenId]);
        return {
            success: 'SUCCESS',
            _pendingtx: _pendingtx.hash,
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
            ) as NL.Redux.Wallet.Error;
            return thunkAPI.rejectWithValue(code);
        }
        return thunkAPI.rejectWithValue('ERROR_LINKING_ACCOUNT');
    }
});

const payOffLoan = createAsyncThunk<
    NL.Redux.Transaction.TxThunkSuccess<NL.Redux.Swap.Success>,
    { tokenId: string; amount: string; provider: Web3Provider; chainId: SupportedChainId },
    // adding the root state type to this thaction causes a circular reference
    { rejectValue: NL.Redux.Wallet.Error }
>(`wallet/payOffLoan`, async ({ tokenId, amount, provider, chainId }, thunkAPI) => {
    try {
        const _pendingtx = await new NuggftV1Helper(chainId, provider).contract
            // .connect(Web3State.getSignerOrProvider())
            .liquidate(tokenId, { value: toEth(amount) });
        return {
            success: 'SUCCESS',
            _pendingtx: _pendingtx.hash,
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

const extend = createAsyncThunk<
    NL.Redux.Transaction.TxThunkSuccess<NL.Redux.Swap.Success>,
    { tokenId: string; amount: string; provider: Web3Provider; chainId: SupportedChainId },
    // adding the root state type to this thaction causes a circular reference
    { rejectValue: NL.Redux.Wallet.Error }
>(`wallet/extend`, async ({ tokenId, amount, provider, chainId }, thunkAPI) => {
    try {
        const _pendingtx = await new NuggftV1Helper(chainId, provider).contract
            // .connect(Web3State.getSignerOrProvider())
            .rebalance([tokenId], { value: toEth(amount) });

        return {
            success: 'SUCCESS',
            _pendingtx: _pendingtx.hash,
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
    getUserShares,
    withdraw,
    claim,
    initLoan,
    payOffLoan,
    extend,
    multiClaim,
    mintNugg,
};
