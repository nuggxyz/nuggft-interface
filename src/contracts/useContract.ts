import { BaseContract, ContractInterface, PopulatedTransaction, BigNumber } from 'ethers';
import { useMemo, useState, useCallback } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { t } from '@lingui/macro';

import web3 from '@src/web3';
import { RevertError } from '@src/lib/errors';
import {
    DotnuggV1,
    DotnuggV1__factory,
    XNuggftV1,
    XNuggftV1__factory,
    NuggftV1,
    NuggftV1__factory,
} from '@src/typechain';
import lib, { shortenTxnHash } from '@src/lib';
import emitter from '@src/emitter';
import client from '@src/client';

function useContract<C extends BaseContract>(
    address: string,
    abi: ContractInterface,
    provider?: Web3Provider,
) {
    return useMemo(() => {
        return new BaseContract(address, abi, provider) as C;
    }, [address, provider, abi]);
}

export function useNuggftV1(provider?: Web3Provider) {
    const chainId = web3.hook.usePriorityChainId();

    const address = useMemo(() => {
        return web3.config.CONTRACTS[chainId ?? web3.config.DEFAULT_CHAIN].NuggftV1;
    }, [chainId]);

    return useContract<NuggftV1>(address, NuggftV1__factory.abi, provider);
}

export function useXNuggftV1(provider?: Web3Provider) {
    const chainId = web3.hook.usePriorityChainId();

    const address = useMemo(() => {
        return web3.config.CONTRACTS[chainId ?? web3.config.DEFAULT_CHAIN].xNuggftV1;
    }, [chainId]);

    return useContract<XNuggftV1>(address, XNuggftV1__factory.abi, provider);
}

export function useDotnuggV1(provider?: Web3Provider) {
    const chainId = web3.hook.usePriorityChainId();

    const address = useMemo(() => {
        return web3.config.CONTRACTS[chainId ?? web3.config.DEFAULT_CHAIN].DotnuggV1;
    }, [chainId]);

    return useContract<DotnuggV1>(address, DotnuggV1__factory.abi, provider);
}

export function useTransactionManager() {
    const [receipt, setReceipt] = useState<TransactionReceipt>();
    const [response, setActiveResponse] = useState<TransactionResponse>();
    const [revert, setRevert] = useState<RevertError | Error>();

    const connector = web3.hook.usePriorityConnector();

    const network = web3.hook.useNetworkProvider();
    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();

    const toasts = client.toast.useList();
    const addToast = client.toast.useAddToast();
    const replaceToast = client.toast.useReplaceToast();

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

                    if (connector.refreshPeer) connector.refreshPeer();

                    const signer = provider.getSigner();
                    const res = network
                        .estimateGas({ ...tx, from: signer.getAddress() })
                        .then((gasLimit) => {
                            emitter.emit({
                                type: emitter.events.TransactionSent,
                            });

                            return provider
                                .getSigner()
                                .sendTransaction({ ...tx, gasLimit: BigNumber.from(gasLimit) })
                                .then((y) => {
                                    addToast({
                                        duration: 0,
                                        title: t`Pending Transaction`,
                                        message: shortenTxnHash(y.hash),
                                        error: false,
                                        id: y.hash,
                                        index: toasts.length,
                                        loading: true,
                                        action: () =>
                                            web3.config.gotoEtherscan(chainId, 'tx', y.hash),
                                    });
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
                                const isSuccess = x.status === 1;
                                replaceToast({
                                    id: x.transactionHash,
                                    duration: isSuccess ? 5000 : 0,
                                    loading: false,
                                    error: !isSuccess,
                                    title: isSuccess
                                        ? 'Successful Transaction'
                                        : 'Transaction Failed',
                                });
                                setReceipt(x);

                                if (onReceipt) onReceipt(x);

                                emitter.emit({
                                    type: emitter.events.TransactionComplete,
                                    txhash: x.transactionHash,
                                    success: isSuccess,
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
