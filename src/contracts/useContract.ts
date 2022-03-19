import { BaseContract, ContractInterface, PopulatedTransaction, BigNumber } from 'ethers';
import { useMemo, useState, useCallback } from 'react';

import web3 from '@src/web3';
import { NuggftV1__factory } from '@src/typechain/factories/NuggftV1__factory';
import { Chain } from '@src/web3/core/interfaces';
import { RevertError } from '@src/lib/errors';
import lib, { shortenTxnHash } from '@src/lib';
import TransactionState from '@src/state/transaction';
import { gotoEtherscan } from '@src/web3/config';
import AppState from '@src/state/app';
import emitter from '@src/emitter';

import { NuggftV1 } from '../typechain/NuggftV1';

function useContract<C extends BaseContract>(address: string, abi: ContractInterface) {
    const provider = web3.hook.usePriorityProvider();

    return useMemo(() => {
        return new BaseContract(address, abi, provider?.getSigner()) as C;
    }, [address, provider, abi]);
}

export default function useNuggftV1() {
    const chainId = web3.hook.usePriorityChainId();

    const address = useMemo(() => {
        return web3.config.CONTRACTS[chainId ?? Chain.MAINNET].NuggftV1;
    }, [chainId]);

    return useContract<NuggftV1>(address, NuggftV1__factory.abi);
}

export function useTransactionManager() {
    const [receipt, setReceipt] = useState<TransactionReceipt>();
    const [response, setActiveResponse] = useState<TransactionResponse>();
    const [revert, setRevert] = useState<RevertError | Error>();

    const network = web3.hook.useNetworkProvider();
    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();

    const send = useCallback(
        async (ptx: Promise<PopulatedTransaction>): Promise<void> => {
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
                                    TransactionState.dispatch.addTransaction(y.hash);
                                    setActiveResponse(y);

                                    AppState.dispatch.addToastToList({
                                        duration: 0,
                                        title: 'Pending Transaction',
                                        message: shortenTxnHash(y.hash),
                                        error: false,
                                        id: y.hash,
                                        index: 0,
                                        loading: true,
                                        action: () => gotoEtherscan(chainId, 'tx', y.hash),
                                        listener: (setClosed, setClosedSoftly, setError) => {
                                            return emitter.on({
                                                type: emitter.events.TransactionComplete,
                                                callback: (arg) => {
                                                    if (arg.txhash === y.hash) {
                                                        if (arg.success) {
                                                            setClosedSoftly();
                                                        } else {
                                                            setError();
                                                        }
                                                    }
                                                },
                                            }).off;
                                        },
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
                        return res2.wait(1).then((x) => {
                            setReceipt(x);
                            TransactionState.dispatch.finalizeTransaction({
                                hash: x.transactionHash,
                                successful: x.status === 1,
                            });
                            emitter.emit({
                                type: emitter.events.TransactionComplete,
                                txhash: x.transactionHash,
                                success: x.status === 1,
                            });
                        });
                    }
                }
                throw new Error('provider undefined');
            } catch (err) {
                const error = lib.errors.parseJsonRpcError(err);
                setRevert(error);
                console.error(error);
                return undefined;
            }
        },
        [provider, network],
    );

    return { response, receipt, revert, send };
}
