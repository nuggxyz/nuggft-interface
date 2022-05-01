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
}

const useStore = create(
    subscribeWithSelector(
        combine(
            {
                potential: {} as { [_: `potential-${string}`]: Transaction },
                data: {} as { [_: Hash]: Transaction },
            },
            (set, get) => {
                function ensureEsists(txhash: Hash) {
                    if (!get().data[txhash])
                        set((draft) => {
                            draft.data[txhash] = {
                                response: false,
                                receipt: false,
                            };
                        });
                }

                function handleReceipt(txhash: Hash): void {
                    ensureEsists(txhash);

                    const dat = get().data[txhash];

                    if (!dat.receipt) {
                        set((draft) => {
                            draft.data[txhash].receipt = true;
                        });
                    }
                }

                async function handleResponse(txhash: Hash, provider: Web3Provider): Promise<void> {
                    ensureEsists(txhash);

                    if (!get().data[txhash].response) {
                        set((draft) => {
                            draft.data[txhash].response = true;
                        });
                    }

                    let check = await provider.getTransactionReceipt(txhash);

                    if (check === null) {
                        check = await provider.waitForTransaction(txhash);
                    }

                    if (!get().data[txhash].receipt)
                        set((draft) => {
                            draft.data[txhash].receipt = true;
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

    emitter.on({
        type: emitter.events.TransactionResponse,
        callback: React.useCallback(
            (args) => {
                if (args.response.from === address && provider)
                    void handleResponse(args.response.hash as Hash, provider);
            },
            [handleResponse, address, provider],
        ),
    });

    emitter.on({
        type: emitter.events.TransactionReceipt,
        callback: React.useCallback(
            (args) => {
                if (address === args.recipt.from)
                    void handleReceipt(args.recipt.transactionHash as Hash);
            },
            [address, handleReceipt],
        ),
    });

    emitter.on({
        type: emitter.events.PotentialTransactionReceipt,
        callback: React.useCallback(
            (args) => {
                if (args.from === address && provider) void handleResponse(args.txhash, provider);
            },
            [handleResponse, address, provider],
        ),
    });

    emitter.on({
        type: emitter.events.PotentialTransactionResponse,
        callback: React.useCallback(
            (args) => {
                if (args.from === address && provider) handleReceipt(args.txhash);
            },
            [address, handleReceipt, provider],
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

export default {
    useTransaction,
    useStore,
};
