/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine, persist } from 'zustand/middleware';
import React, { useCallback } from 'react';
import shallow from 'zustand/shallow';
import { Web3Provider } from '@ethersproject/providers';

import web3 from '@src/web3';
import emitter from '@src/emitter';

interface Transaction {
    response?: TransactionResponse;
    receipt?: TransactionReceipt;
}

const useStore = create(
    persist(
        combine(
            {
                potential: {} as { [_: `potential-${string}`]: Transaction },
                data: {} as { [_: Hash]: Transaction },
            },
            (set, get) => {
                function updateReceipt(data: TransactionReceipt): void {
                    set((draft) => {
                        if (!get().data[data.transactionHash as Hash])
                            draft.data[data.transactionHash as Hash] = {};
                        draft.data[data.transactionHash as Hash].receipt = data;
                    });
                }

                async function potentialReceipt(
                    txhash: Hash,
                    provider: Web3Provider,
                ): Promise<void> {
                    if (!get().data[txhash]?.receipt) {
                        updateReceipt(await provider.getTransactionReceipt(txhash));
                    }
                }

                function updateResponse(data: TransactionResponse): void {
                    set((draft) => {
                        if (!get().data[data.hash as Hash]) draft.data[data.hash as Hash] = {};
                        draft.data[data.hash as Hash].response = data;
                    });
                }

                async function potentialResponse(
                    txhash: Hash,
                    provider: Web3Provider,
                ): Promise<void> {
                    if (!get().data[txhash]?.receipt) {
                        updateResponse(await provider.getTransaction(txhash));
                    }
                }

                function clear() {
                    set(() => {
                        return { data: {} };
                    });
                }

                return {
                    updateResponse,
                    clear,
                    updateReceipt,
                    potentialReceipt,
                    potentialResponse,
                };
            },
        ),
        { name: 'nuggftv1-transaction' },
    ),
);

export const useUpdateTransactionOnEmit = () => {
    const address = web3.hook.usePriorityAccount();
    const provider = web3.hook.usePriorityProvider();

    const updateResponse = useStore((store) => store.updateResponse);
    const updateReceipt = useStore((store) => store.updateReceipt);
    const potentialReceipt = useStore((store) => store.potentialReceipt);
    const potentialResponse = useStore((store) => store.potentialResponse);

    emitter.on({
        type: emitter.events.TransactionResponse,
        callback: React.useCallback(
            (args) => {
                if (args.response.from === address) updateResponse(args.response);
            },
            [updateResponse, address],
        ),
    });

    emitter.on({
        type: emitter.events.TransactionReceipt,
        callback: React.useCallback(
            (args) => {
                if (address === args.recipt.from) void updateReceipt(args.recipt);
            },
            [address, updateReceipt],
        ),
    });

    emitter.on({
        type: emitter.events.PotentialTransactionReceipt,
        callback: React.useCallback(
            (args) => {
                if (args.from === address && provider) void potentialReceipt(args.txhash, provider);
            },
            [potentialReceipt, address, provider],
        ),
    });

    emitter.on({
        type: emitter.events.PotentialTransactionResponse,
        callback: React.useCallback(
            (args) => {
                if (args.from === address && provider)
                    void potentialResponse(args.txhash, provider);
            },
            [address, potentialResponse, provider],
        ),
    });
};

export default {
    useTransaction: (txhash?: Hash) =>
        useStore(
            useCallback(
                (state) => (txhash !== undefined ? state.data[txhash] : undefined),
                [txhash],
            ),
            shallow,
        ),
    useStore,
};
