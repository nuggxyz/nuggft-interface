/* eslint-disable no-unexpected-multiline */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Web3Provider } from '@ethersproject/providers';
import { BigNumber, BigNumberish } from 'ethers';

import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import {
    extractItemId,
    isUndefinedOrNullOrNotObject,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '@src/lib';
import AppState from '@src/state/app';
import { toEth } from '@src/lib/conversion';
import { Chain } from '@src/web3/core/interfaces';
import { NuggId } from '@src/client/router';
import emitter from '@src/emitter';
import { NuggftV1__factory } from '@src/typechain/factories/NuggftV1__factory';

const placeOffer = createAsyncThunk<
    TxThunkSuccess<WalletSuccess>,
    {
        amount: string;
        tokenId: string;
        provider: Web3Provider;
        chainId: Chain;
        address: string;
        buyingTokenId?: string;
        sellingTokenId?: string;
    },
    { rejectValue: WalletError }
>(
    'wallet/placeOffer',
    async (
        { amount, tokenId, provider, chainId, address, buyingTokenId, sellingTokenId },
        thunkAPI,
    ) => {
        try {
            let _pendingtx;
            if (buyingTokenId && sellingTokenId) {
                _pendingtx = await new NuggftV1Helper(chainId, provider).contract
                    .connect(provider.getSigner(address))
                    ['offer(uint160,uint160,uint16)'](
                        buyingTokenId,
                        sellingTokenId,
                        BigNumber.from(extractItemId(tokenId)),
                        {
                            value: toEth(amount),
                        },
                    );
            } else {
                _pendingtx = await new NuggftV1Helper(chainId, provider).contract
                    .connect(provider.getSigner(address))
                    ['offer(uint160)'](BigNumber.from(tokenId), {
                        value: toEth(amount),
                    });
            }

            return {
                success: 'SUCCESS',
                _pendingtx: _pendingtx.hash,
                chainId,
                callbackFn: () => {
                    AppState.dispatch.setModalClosed();
                },
            };
        } catch (err: any) {
            console.log(err);
            const abc = NuggftV1__factory.createInterface().decodeErrorResult(
                'Revert',
                (err as { data?: BytesLike })?.data || '0x0',
            );

            console.log('hi there', abc);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (err !== undefined && err.method !== undefined && err.method === 'estimateGas') {
                return thunkAPI.rejectWithValue('GAS_ERROR');
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (err && err.data && err.data.message) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const code = (err.data.message as string).replace(
                    'execution reverted: ',
                    '',
                ) as WalletError;
                return thunkAPI.rejectWithValue(code);
            }
            return thunkAPI.rejectWithValue('UNKNOWN');
        }
    },
);

const initSale = createAsyncThunk<
    TxThunkSuccess<WalletSuccess>,
    {
        tokenId: string;
        itemId?: string;
        floor: BigNumberish;
        chainId: Chain;
        provider: Web3Provider;
        address: string;
    },
    { rejectValue: WalletError }
>(`wallet/initSale`, async ({ tokenId, floor, chainId, provider, address, itemId }, thunkAPI) => {
    try {
        let _pendingtx;

        console.log({ tokenId, itemId, floor });
        if (itemId) {
            _pendingtx = await new NuggftV1Helper(chainId, provider).contract
                .connect(provider.getSigner(address))
                ['sell(uint160,uint16,uint96)'](tokenId, itemId, floor);
        } else {
            _pendingtx = await new NuggftV1Helper(chainId, provider).contract
                .connect(provider.getSigner(address))
                ['sell(uint160,uint96)'](tokenId, floor);
        }

        return {
            success: 'SUCCESS' as WalletSuccess,
            _pendingtx: _pendingtx.hash,
            chainId,
            callbackFn: () => AppState.dispatch.setModalClosed(),
        };
    } catch (err: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (err && err.method && err.method === 'estimateGas') {
            return thunkAPI.rejectWithValue('GAS_ERROR' as WalletError);
        }
        if (
            !isUndefinedOrNullOrNotObject(err) &&
            !isUndefinedOrNullOrNotObject(err.data) &&
            !isUndefinedOrNullOrStringEmpty(err.data.message)
        ) {
            const code = (err.data.message as string).replace(
                'execution reverted: ',
                '',
            ) as WalletError;
            return thunkAPI.rejectWithValue(code);
        }
        return thunkAPI.rejectWithValue('GAS_ERROR');
    }
});

const withdraw = createAsyncThunk<
    TxThunkSuccess<WalletSuccess>,
    { tokenId: string; provider: Web3Provider; chainId: Chain; address: string },
    // adding the root state type to this thaction causes a circular reference
    { rejectValue: WalletError }
>(`wallet/withdraw`, async ({ tokenId, provider, chainId, address }, thunkAPI) => {
    try {
        const _pendingtx = await new NuggftV1Helper(chainId, provider).contract
            .connect(provider.getSigner(address))
            .burn(tokenId);
        return {
            success: 'SUCCESS',
            _pendingtx: _pendingtx.hash,
            chainId,
            callbackFn: () => AppState.dispatch.setModalClosed(),
        };
    } catch (err: any) {
        console.log({ err: err as string });
        if (
            !isUndefinedOrNullOrNotObject(err) &&
            !isUndefinedOrNullOrNotObject(err.data) &&
            !isUndefinedOrNullOrStringEmpty(err.data.message)
        ) {
            const code = (err.data.message as string).replace(
                'execution reverted: ',
                '',
            ) as WalletError;
            return thunkAPI.rejectWithValue(code);
        }
        return thunkAPI.rejectWithValue('ERROR_LINKING_ACCOUNT');
    }
});

const claim = createAsyncThunk<
    TxThunkSuccess<WalletSuccess>,
    {
        tokenId: string;
        provider: Web3Provider;
        chainId: Chain;
        address?: string;
        sender: string;
    },
    // adding the root state type to this thaction causes a circular reference
    { rejectValue: WalletError }
>(`wallet/claim`, async ({ tokenId, provider, chainId, sender, address }, thunkAPI) => {
    try {
        console.log(address);
        const _pendingtx = await new NuggftV1Helper(chainId, provider).contract
            .connect(provider.getSigner(sender))
            ['claim(uint160[],address[])']([tokenId], [address || sender]);
        return {
            success: 'SUCCESS',
            _pendingtx: _pendingtx.hash,
            chainId,
        };
    } catch (err: any) {
        console.log({ err: err as string });
        if (
            !isUndefinedOrNullOrNotObject(err) &&
            !isUndefinedOrNullOrNotObject(err.data) &&
            !isUndefinedOrNullOrStringEmpty(err.data.message)
        ) {
            const code = (err.data.message as string).replace(
                'execution reverted: ',
                '',
            ) as WalletError;
            return thunkAPI.rejectWithValue(code);
        }
        return thunkAPI.rejectWithValue('ERROR_LINKING_ACCOUNT');
    }
});

const multiClaim = createAsyncThunk<
    TxThunkSuccess<WalletSuccess>,
    {
        tokenIds: string[];
        provider: Web3Provider;
        chainId: Chain;
        sender: string;
        addresses: string[];
    },
    // adding the root state type to this thaction causes a circular reference
    { rejectValue: WalletError }
>(`wallet/multiClaim`, async ({ tokenIds, provider, chainId, sender, addresses }, thunkAPI) => {
    try {
        const _pendingtx = await new NuggftV1Helper(chainId, provider).contract
            .connect(provider.getSigner(sender))
            ['claim(uint160[],address[])'](tokenIds, addresses, {
                gasLimit: 500000,
            });
        return {
            success: 'SUCCESS',
            _pendingtx: _pendingtx.hash,
            chainId,
        };
    } catch (err: any) {
        console.log({ err: err as string });
        if (
            !isUndefinedOrNullOrNotObject(err) &&
            !isUndefinedOrNullOrNotObject(err.data) &&
            !isUndefinedOrNullOrStringEmpty(err.data.message)
        ) {
            const code = (err.data.message as string).replace(
                'execution reverted: ',
                '',
            ) as WalletError;
            return thunkAPI.rejectWithValue(code);
        }
        return thunkAPI.rejectWithValue('ERROR_LINKING_ACCOUNT');
    }
});

const mintNugg = createAsyncThunk<
    TxThunkSuccess<WalletSuccess>,
    {
        chainId: Chain;
        provider: Web3Provider;
        address: string;
        nextNugg: NuggId;
        nuggPrice: BigNumber;
    },
    // adding the root state type to this thaction causes a circular reference
    { rejectValue: WalletError }
>(`wallet/mintNugg`, async ({ chainId, provider, address, nuggPrice, nextNugg }, thunkAPI) => {
    try {
        const _pendingtx = await new NuggftV1Helper(chainId, provider).contract
            .connect(provider.getSigner(address))
            .mint(nextNugg, {
                value: nuggPrice,
            });

        emitter.emit({ type: emitter.events.TransactionInitiated, txhash: _pendingtx.hash });
        return {
            success: 'SUCCESS',
            _pendingtx: _pendingtx.hash,
            chainId,
            // callbackFn: () => {
            //     AppState.dispatch.setModalClosed();
            // },
        };
    } catch (err: any) {
        console.log({ err: err as string });
        if (
            !isUndefinedOrNullOrNotObject(err) &&
            !isUndefinedOrNullOrNotObject(err.data) &&
            !isUndefinedOrNullOrStringEmpty(err.data.message)
        ) {
            const code = (err.data.message as string).replace(
                'execution reverted: ',
                '',
            ) as WalletError;
            return thunkAPI.rejectWithValue(code);
        }
        return thunkAPI.rejectWithValue('ERROR_LINKING_ACCOUNT');
    }
});

const initLoan = createAsyncThunk<
    TxThunkSuccess<WalletSuccess>,
    { tokenId: string; provider: Web3Provider; chainId: Chain; address: string },
    // adding the root state type to this thaction causes a circular reference
    { rejectValue: WalletError }
>(`wallet/initLoan`, async ({ tokenId, provider, chainId, address }, thunkAPI) => {
    try {
        const _pendingtx = await new NuggftV1Helper(chainId, provider).contract
            .connect(provider.getSigner(address))
            .loan([tokenId]);
        return {
            success: 'SUCCESS',
            _pendingtx: _pendingtx.hash,
            chainId,
            callbackFn: () => AppState.dispatch.setModalClosed(),
        };
    } catch (err: any) {
        console.log({ err: err as string });
        if (
            !isUndefinedOrNullOrNotObject(err) &&
            !isUndefinedOrNullOrNotObject(err.data) &&
            !isUndefinedOrNullOrStringEmpty(err.data.message)
        ) {
            const code = (err.data.message as string).replace(
                'execution reverted: ',
                '',
            ) as WalletError;
            return thunkAPI.rejectWithValue(code);
        }
        return thunkAPI.rejectWithValue('ERROR_LINKING_ACCOUNT');
    }
});

const payOffLoan = createAsyncThunk<
    TxThunkSuccess<WalletSuccess>,
    {
        tokenId: string;
        amount: string;
        provider: Web3Provider;
        chainId: Chain;
        address: string;
    },
    // adding the root state type to this thaction causes a circular reference
    { rejectValue: WalletError }
>(`wallet/payOffLoan`, async ({ tokenId, amount, provider, chainId, address }, thunkAPI) => {
    try {
        const _pendingtx = await new NuggftV1Helper(chainId, provider).contract
            .connect(provider.getSigner(address))
            // .connect(Web3State.getSignerOrProvider())
            .liquidate(tokenId, { value: toEth(amount) });
        return {
            success: 'SUCCESS',
            _pendingtx: _pendingtx.hash,
            chainId,
            callbackFn: () => AppState.dispatch.setModalClosed(),
        };
    } catch (err: any) {
        console.log({ err: err as string });
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
            const code = (err.data.message as string).replace(
                'execution reverted: ',
                '',
            ) as WalletError;
            return thunkAPI.rejectWithValue(code);
        }
        return thunkAPI.rejectWithValue('ERROR_LINKING_ACCOUNT');
    }
});

const extend = createAsyncThunk<
    TxThunkSuccess<WalletSuccess>,
    {
        tokenId: string;
        amount: string;
        provider: Web3Provider;
        chainId: Chain;
        address: string;
    },
    // adding the root state type to this thaction causes a circular reference
    { rejectValue: WalletError }
>(`wallet/extend`, async ({ tokenId, amount, provider, chainId, address }, thunkAPI) => {
    try {
        const _pendingtx = await new NuggftV1Helper(chainId, provider).contract
            .connect(provider.getSigner(address))
            // .connect(Web3State.getSignerOrProvider())
            .rebalance([tokenId], { value: toEth(amount) });

        return {
            success: 'SUCCESS',
            _pendingtx: _pendingtx.hash,
            chainId,
            callbackFn: () => AppState.dispatch.setModalClosed(),
        };
    } catch (err: any) {
        console.log({ err: err as string });
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
            const code = (err.data.message as string).replace(
                'execution reverted: ',
                '',
            ) as WalletError;
            return thunkAPI.rejectWithValue(code);
        }
        return thunkAPI.rejectWithValue('ERROR_LINKING_ACCOUNT');
    }
});

export default {
    withdraw,
    claim,
    initLoan,
    payOffLoan,
    extend,
    multiClaim,
    mintNugg,
    initSale,
    placeOffer,
};
