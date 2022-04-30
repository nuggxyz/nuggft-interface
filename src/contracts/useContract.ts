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
import { Connector } from '@src/web3/core/interfaces';

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
    const [estimateRevert, setEstimateRevert] = useState<RevertError | Error>();

    const connector = web3.hook.usePriorityConnector();

    const network = web3.hook.useNetworkProvider();
    const provider = web3.hook.usePriorityProvider();
    const coreProvider = web3.hook.usePriorityCoreProvider();

    const chainId = web3.hook.usePriorityChainId();
    const address = web3.hook.usePriorityAccount();

    const toasts = client.toast.useList();
    const addToast = client.toast.useAddToast();
    const replaceToast = client.toast.useReplaceToast();

    const estimate = useCallback(
        async (ptx: Promise<PopulatedTransaction>) => {
            try {
                if (provider && network && chainId) {
                    const tx = await ptx;
                    const signer = provider.getSigner();
                    return network
                        .estimateGas({ ...tx, from: signer.getAddress() })
                        .then((gasLimit) => {
                            setEstimateRevert(undefined);
                            console.log(
                                'estimate passed - should take ',
                                gasLimit.toNumber(),
                                ' gas',
                            );
                            return gasLimit;
                        })
                        .catch((err: Error) => {
                            const error = lib.errors.parseJsonRpcError(err);
                            setEstimateRevert(error);
                            console.error(error);
                            return null;
                        });
                }
                throw new Error('provider undefined');
            } catch (err) {
                const error = lib.errors.parseJsonRpcError(err);
                setEstimateRevert(error);
                console.error(error);
                return null;
            }
        },
        [provider, network, chainId],
    );

    const send = useCallback(
        async (
            ptx: Promise<PopulatedTransaction>,
            onResponse?: (response: TransactionResponse) => void,
            onReceipt?: (response: TransactionReceipt) => void,
            onSendSync?: (gasLimit: BigNumber) => void,
        ): Promise<void> => {
            setRevert(undefined);

            try {
                if (provider && network && coreProvider && chainId && address) {
                    const tx = await ptx;

                    if (connector.refreshPeer) connector.refreshPeer();

                    // const signer = (connector.provider as WalletConnectProvider).connector.sendTransaction
                    const res = await provider
                        .estimateGas({ ...tx, from: address })
                        .then(async (gasLimit) => {
                            return Promise.all([
                                coreProvider.type === Connector.WalletConnect
                                    ? (coreProvider.provider.connector.sendTransaction({
                                          to: tx.to,
                                          from: address,
                                          type: '2',
                                          value:
                                              tx.value
                                                  ?.toHexString()
                                                  .replace('0x0', '')
                                                  .replace('0x', '') || 0,
                                          data: tx.data,
                                      }) as Promise<string>)
                                    : provider.getSigner().sendTransaction(tx),
                                onSendSync ? onSendSync(gasLimit) : undefined,
                                emitter.emit({
                                    type: emitter.events.TransactionSent,
                                }),
                            ])
                                .then(async ([y]) => {
                                    let tmp: TransactionResponse;
                                    if (typeof y === 'string') {
                                        tmp = await provider.getTransaction(y);
                                    } else {
                                        tmp = y;
                                    }
                                    console.log({ y, tmp });
                                    addToast({
                                        duration: 0,
                                        title: t`Pending Transaction`,
                                        message: shortenTxnHash(tmp.hash),
                                        error: false,
                                        id: tmp.hash,
                                        index: toasts.length,
                                        loading: true,
                                        action: () =>
                                            web3.config.gotoEtherscan(chainId, 'tx', tmp.hash),
                                    });
                                    setActiveResponse(tmp);

                                    // if (onResponse) onResponse(y);

                                    emitter.emit({
                                        type: emitter.events.PotentialTransactionResponse,
                                        txhash: tmp.hash as Hash,
                                        from: address as AddressString,
                                    });

                                    return tmp;
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

                    const res2 = res;

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
                                    type: emitter.events.PotentialTransactionReceipt,
                                    txhash: x.transactionHash as Hash,
                                    success: isSuccess,
                                    from: res2.from as AddressString,
                                });
                            })
                            .catch((err) => {
                                const error = lib.errors.parseJsonRpcError(err);
                                emitter.emit({
                                    type: emitter.events.PotentialTransactionReceipt,
                                    txhash: res2.hash as Hash,
                                    success: false,
                                    from: res2.from as AddressString,
                                    error,
                                });
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

    // const sendWalletConnect = useCallback(
    //     async (
    //         ptx: Promise<PopulatedTransaction>,
    //         onResponse?: (response: TransactionResponse) => void,
    //         onReceipt?: (response: TransactionReceipt) => void,
    //         onSendSync?: (gasLimit: BigNumber) => void,
    //     ): Promise<void> => {
    //         setRevert(undefined);

    //         try {
    //             if (
    //                 coreProvider &&
    //                 coreProvider.type === Connector.WalletConnect &&
    //                 provider &&
    //                 chainId &&
    //                 address
    //             ) {
    //                 const tx = await ptx;

    //                 if (connector.refreshPeer) connector.refreshPeer();

    //                 const res = await provider
    //                     .estimateGas({ ...tx, from: address })
    //                     .then(async (gasLimit) => {
    //                         return Promise.all([
    //                             coreProvider.provider.connector.sendTransaction({
    //                                 // ...tx,

    //                                 to: tx.to,
    //                                 from: address,
    //                                 type: '2',
    //                                 value:
    //                                     tx.value
    //                                         ?.toHexString()
    //                                         .replace('0x0', '')
    //                                         .replace('0x', '') || 0,
    //                                 data: tx.data,
    //                             }),
    //                             onSendSync ? onSendSync(gasLimit) : undefined,
    //                             emitter.emit({
    //                                 type: emitter.events.TransactionSent,
    //                             }),
    //                         ])
    //                             .then(([y]: string[]) => {
    //                                 console.log({ y });
    //                                 addToast({
    //                                     duration: 0,
    //                                     title: t`Pending Transaction`,
    //                                     message: shortenTxnHash(y),
    //                                     error: false,
    //                                     id: y,
    //                                     index: toasts.length,
    //                                     loading: true,
    //                                     action: () => web3.config.gotoEtherscan(chainId, 'tx', y),
    //                                 });
    //                                 // setActiveResponse(y);

    //                                 // if (onResponse) onResponse(y);

    //                                 emitter.emit({
    //                                     type: emitter.events.PotentialTransactionResponse,
    //                                     txhash: y as Hash,
    //                                     from: address as AddressString,
    //                                 });

    //                                 return y;
    //                             })
    //                             .catch((err: Error) => {
    //                                 const error = lib.errors.parseJsonRpcError(err);
    //                                 setRevert(error);
    //                                 console.error(error);
    //                             });
    //                     })
    //                     .catch((err: Error) => {
    //                         const error = lib.errors.parseJsonRpcError(err);
    //                         setRevert(error);
    //                         console.error(error);
    //                     });

    //                 const res2 = await provider.getTransaction(res as string);

    //                 if (res2) {
    //                     return res2
    //                         .wait(1)
    //                         .then((x) => {
    //                             const isSuccess = x.status === 1;
    //                             replaceToast({
    //                                 id: x.transactionHash,
    //                                 duration: isSuccess ? 5000 : 0,
    //                                 loading: false,
    //                                 error: !isSuccess,
    //                                 title: isSuccess
    //                                     ? 'Successful Transaction'
    //                                     : 'Transaction Failed',
    //                             });
    //                             setReceipt(x);

    //                             if (onReceipt) onReceipt(x);

    //                             emitter.emit({
    //                                 type: emitter.events.PotentialTransactionReceipt,
    //                                 txhash: x.transactionHash as Hash,
    //                                 success: isSuccess,
    //                                 from: res2.from as AddressString,
    //                             });
    //                         })
    //                         .catch((err) => {
    //                             const error = lib.errors.parseJsonRpcError(err);
    //                             emitter.emit({
    //                                 type: emitter.events.PotentialTransactionReceipt,
    //                                 txhash: res2.hash as Hash,
    //                                 success: false,
    //                                 from: res2.from as AddressString,
    //                                 error,
    //                             });
    //                             setRevert(error);
    //                         });
    //                 }
    //             }
    //             return undefined;
    //             // throw new Error('provider undefined');
    //         } catch (err) {
    //             const error = lib.errors.parseJsonRpcError(err);
    //             setRevert(error);
    //             console.error(error);
    //             return undefined;
    //         }
    //     },
    //     [provider, network, chainId],
    // );

    return { response, receipt, revert, send, estimate, estimateRevert };
}
