import { BaseContract, ContractInterface, PopulatedTransaction, BigNumber } from 'ethers';
import { useMemo, useState, useCallback } from 'react';

import web3 from '@src/web3';
import { NuggftV1__factory } from '@src/typechain/factories/NuggftV1__factory';
import { RevertError } from '@src/lib/errors';
import { DotnuggV1, DotnuggV1__factory } from '@src/typechain';
import lib from '@src/lib';
import emitter from '@src/emitter';

import { NuggftV1 } from '../typechain/NuggftV1';

function useContract<C extends BaseContract>(address: string, abi: ContractInterface) {
    const provider = web3.hook.usePriorityProvider();

    return useMemo(() => {
        return new BaseContract(address, abi, provider?.getSigner()) as C;
    }, [address, provider, abi]);
}

export function useNuggftV1() {
    const chainId = web3.hook.usePriorityChainId();

    const address = useMemo(() => {
        return web3.config.CONTRACTS[chainId ?? web3.config.DEFAULT_CHAIN].NuggftV1;
    }, [chainId]);

    return useContract<NuggftV1>(address, NuggftV1__factory.abi);
}

export function useDotnuggV1() {
    const chainId = web3.hook.usePriorityChainId();

    const address = useMemo(() => {
        return web3.config.CONTRACTS[chainId ?? web3.config.DEFAULT_CHAIN].DotnuggV1;
    }, [chainId]);

    return useContract<DotnuggV1>(address, DotnuggV1__factory.abi);
}

export function useTransactionManager() {
    const [receipt, setReceipt] = useState<TransactionReceipt>();
    const [response, setActiveResponse] = useState<TransactionResponse>();
    const [revert, setRevert] = useState<RevertError | Error>();

    const network = web3.hook.useNetworkProvider();
    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();

    const estimate = useCallback(
        async (ptx: Promise<PopulatedTransaction>): Promise<boolean> => {
            try {
                if (provider && network && chainId) {
                    const tx = await ptx;
                    const signer = provider.getSigner();
                    return network
                        .estimateGas({ ...tx, from: signer.getAddress() })
                        .then((gasLimit) => {
                            console.log(
                                'estimate passed - should take ',
                                gasLimit.toNumber(),
                                ' gas',
                            );
                            return true;
                        })
                        .catch((err: Error) => {
                            const error = lib.errors.parseJsonRpcError(err);
                            setRevert(error);
                            console.error(error);
                            return false;
                        });
                }
                throw new Error('provider undefined');
            } catch (err) {
                const error = lib.errors.parseJsonRpcError(err);
                setRevert(error);
                console.error(error);
                return false;
            }
        },
        [provider, network, chainId],
    );

    const send = useCallback(
        async (
            ptx: Promise<PopulatedTransaction>,
            onResponse?: (response: TransactionResponse) => void,
            onReceipt?: (response: TransactionReceipt) => void,
        ): Promise<void> => {
            try {
                if (provider && network && chainId) {
                    const tx = await ptx;
                    const signer = provider.getSigner();
                    const res = network
                        .estimateGas({ ...tx, from: signer.getAddress() })
                        .then((gasLimit) => {
                            return provider
                                .getSigner()
                                .sendTransaction({ ...tx, gasLimit: BigNumber.from(gasLimit) })
                                .then((y) => {
                                    // TransactionState.dispatch.addTransaction(y.hash);
                                    setActiveResponse(y);

                                    if (onResponse) onResponse(y);

                                    emitter.emit({
                                        type: emitter.events.TransactionInitiated,
                                        txhash: y.hash,
                                    });

                                    return y;
                                })
                                .catch((err: Error) => {
                                    const error = lib.errors.parseJsonRpcError(err);
                                    setRevert(error);
                                    console.error(error);
                                });
                        })
                        .catch((err: Error) => {
                            const error = lib.errors.parseJsonRpcError(err);
                            setRevert(error);
                            console.error(error);
                        });

                    const res2 = await res;
                    if (res2) {
                        return res2
                            .wait(1)
                            .then((x) => {
                                setReceipt(x);

                                if (onReceipt) onReceipt(x);

                                emitter.emit({
                                    type: emitter.events.TransactionComplete,
                                    txhash: x.transactionHash,
                                    success: x.status === 1,
                                });
                            })
                            .catch((err) => {
                                emitter.emit({
                                    type: emitter.events.TransactionComplete,
                                    txhash: res2.hash,
                                    success: false,
                                });
                                const error = lib.errors.parseJsonRpcError(err);

                                setRevert(error);
                            });
                    }
                }
                return undefined;
                // throw new Error('provider undefined');
            } catch (err) {
                const error = lib.errors.parseJsonRpcError(err);
                setRevert(error);
                console.error(error);
                return undefined;
            }
        },
        [provider, network, chainId],
    );

    return { response, receipt, revert, send, estimate };
}
