/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine, subscribeWithSelector } from 'zustand/middleware';
import React, { useCallback } from 'react';
import { Web3Provider } from '@ethersproject/providers';

import web3 from '@src/web3';
import emitter from '@src/emitter';

interface Transaction {
    response: boolean;
    receipt: boolean;
    result: TransactionReceipt | null;
}

const useStore = create(
    subscribeWithSelector(
        combine(
            {
                data: {} as { [_: Hash]: Transaction },
            },
            (set, get) => {
                function ensureExists(txhash: Hash) {
                    if (!get().data[txhash])
                        set((draft) => {
                            draft.data[txhash] = {
                                response: false,
                                receipt: false,
                                result: null,
                            };
                        });
                }

                function handleResult(res: TransactionReceipt): void {
                    const hash = res.transactionHash as Hash;
                    ensureExists(hash);

                    const dat = get().data[hash];

                    set((draft) => {
                        if (!dat.receipt) draft.data[hash].receipt = true;
                        if (!dat.response) draft.data[hash].response = true;
                        if (!dat.result) draft.data[hash].result = res;
                    });
                }

                async function handleReceipt(txhash: Hash, provider: Web3Provider): Promise<void> {
                    ensureExists(txhash);

                    const dat = get().data[txhash];

                    if (!dat.receipt) {
                        set((draft) => {
                            draft.data[txhash].receipt = true;
                        });
                    }

                    if (!dat.result) {
                        let check = await provider.getTransactionReceipt(txhash);

                        if (check === null) {
                            check = await provider.waitForTransaction(txhash);
                        }
                        set((draft) => {
                            if (!get().data[txhash].result) draft.data[txhash].result = check;
                        });
                    }
                }

                async function handleResponse(txhash: Hash, provider: Web3Provider): Promise<void> {
                    ensureExists(txhash);

                    if (!get().data[txhash].response) {
                        set((draft) => {
                            draft.data[txhash].response = true;
                        });
                    }

                    let check = await provider.getTransactionReceipt(txhash);

                    if (check === null) {
                        check = await provider.waitForTransaction(txhash);
                    }

                    set((draft) => {
                        if (!get().data[txhash].receipt) draft.data[txhash].receipt = true;
                        if (!get().data[txhash].result) draft.data[txhash].result = check;
                    });
                }

                function clear() {
                    set(() => {
                        return { data: {} };
                    });
                }

                return {
                    handleResponse,
                    clear,
                    handleReceipt,
                    handleResult,
                };
            },
        ),
    ),
);

export const useUpdateTransactionOnEmit = () => {
    const address = web3.hook.usePriorityAccount();
    const provider = web3.hook.usePriorityProvider();

    const handleResponse = useStore((store) => store.handleResponse);
    const handleReceipt = useStore((store) => store.handleReceipt);
    const handleResult = useStore((store) => store.handleResult);

    emitter.hook.useOn({
        type: emitter.events.TransactionResponse,
        callback: React.useCallback(
            (args) => {
                if (args.response.from === address && provider)
                    void handleResponse(args.response.hash as Hash, provider);
            },
            [handleResponse, address, provider],
        ),
    });

    emitter.hook.useOn({
        type: emitter.events.TransactionReceipt,
        callback: React.useCallback(
            (args) => {
                if (address === args.recipt.from && provider) void handleResult(args.recipt);
            },
            [address, handleResult, provider],
        ),
    });

    emitter.hook.useOn({
        type: emitter.events.PotentialTransactionReceipt,
        callback: React.useCallback(
            (args) => {
                console.log('ayyyooooooooooooooo', address, args.from, args);
                if (args.from === address && provider) void handleReceipt(args.txhash, provider);
            },
            [handleReceipt, address, provider],
        ),
    });

    emitter.hook.useOn({
        type: emitter.events.PotentialTransactionResponse,
        callback: React.useCallback(
            (args) => {
                console.log('ayyyooooooooooooooo22222222', address, args.from, args);

                if (args.from === address && provider) void handleResponse(args.txhash, provider);
            },
            [address, handleResponse, provider],
        ),
    });
};

const useTransaction = (txhash?: Hash) => {
    const response = useStore(
        useCallback(
            (state) => (txhash !== undefined ? state.data[txhash]?.response : undefined),
            [txhash],
        ),
    );

    const receipt = useStore(
        useCallback(
            (state) => (txhash !== undefined ? state.data[txhash]?.receipt : undefined),
            [txhash],
        ),
    );
    return { response, receipt };
};

const useTransactionResult = (txhash?: Hash) => {
    const response = useTransaction(txhash);

    const result = useStore(
        useCallback(
            (state) => (txhash !== undefined ? state.data[txhash]?.result : undefined),
            [txhash],
        ),
    );
    return { ...response, result };
};

export default {
    useTransaction,
    useTransactionResult,
    useStore,
};
