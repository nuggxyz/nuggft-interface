import React, { useMemo, useCallback } from 'react';
import { t } from '@lingui/macro';
import { BaseContract, ContractInterface, PopulatedTransaction } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';

import { CustomWeb3Provider } from '@src/web3/classes/CustomWeb3Provider';
import web3 from '@src/web3';
import { RevertError, RejectionError, CustomError } from '@src/lib/errors';
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
import { Connector, CoreProvider } from '@src/web3/core/types';
import { Connector as ConnectorEnum } from '@src/web3/core/interfaces';
import usePrevious from '@src/hooks/usePrevious';
import { CustomEtherscanProvider } from '@src/web3/classes/CustomEtherscanProvider';
import useDimensions from '@src/client/hooks/useDimensions';

function useContract<C extends BaseContract>(
    address: string,
    abi: ContractInterface,
    provider?: CustomWeb3Provider,
) {
    return useMemo(() => {
        return new BaseContract(address, abi, provider) as C;
    }, [address, provider, abi]);
}

export function useNuggftV1(provider?: CustomWeb3Provider) {
    const chainId = web3.hook.usePriorityChainId();

    const address = useMemo(() => {
        return web3.config.CONTRACTS[chainId ?? web3.config.DEFAULT_CHAIN].NuggftV1;
    }, [chainId]);

    return useContract<NuggftV1>(address, NuggftV1__factory.abi, provider);
}

export function useXNuggftV1(provider?: CustomWeb3Provider) {
    const chainId = web3.hook.usePriorityChainId();

    const address = useMemo(() => {
        return web3.config.CONTRACTS[chainId ?? web3.config.DEFAULT_CHAIN].xNuggftV1;
    }, [chainId]);

    return useContract<XNuggftV1>(address, XNuggftV1__factory.abi, provider);
}

export function useDotnuggV1(provider?: CustomWeb3Provider) {
    const chainId = web3.hook.usePriorityChainId();

    const address = useMemo(() => {
        return web3.config.CONTRACTS[chainId ?? web3.config.DEFAULT_CHAIN].DotnuggV1;
    }, [chainId]);

    return useContract<DotnuggV1>(address, DotnuggV1__factory.abi, provider);
}

export const useEstimateTransaction = (provider?: CustomWeb3Provider, from?: AddressString) => {
    const [error, setError] = React.useState<RevertError | Error>();

    const [gasLimit, setGasLimit] = React.useState<number>();

    const estimate = useCallback(
        async (ptx: Promise<PopulatedTransaction>) => {
            try {
                if (provider && from) {
                    const tx = await ptx;
                    return await provider
                        .estimateGas({ ...tx, from })
                        .then((_gasLimit) => {
                            setError(undefined);
                            console.log(
                                'estimate passed - should take ',
                                _gasLimit.toNumber(),
                                ' gas',
                            );
                            setGasLimit(_gasLimit.toNumber());
                            return _gasLimit;
                        })
                        .catch((err: Error) => {
                            const fmt = lib.errors.parseJsonRpcError(err);
                            setError(fmt);
                            setGasLimit(undefined);
                            console.error(fmt);
                            return null;
                        });
                }
                throw new Error('provider or address undefined');
            } catch (err) {
                const fmt = lib.errors.parseJsonRpcError(err);
                setError(fmt);
                setGasLimit(undefined);
                console.error(fmt);
                return undefined;
            }
        },
        [provider, from],
    );

    return { error, gasLimit, estimate };
};

type SimpleTransactionData = {
    to: AddressString;
    value: BigNumber;
    data: Hash;
    from: AddressString;
    startBlock: number;
    sentAt: Date;
};

function useSendTransaction(
    network?: CustomWeb3Provider,
    authenticatedProvider?: CustomWeb3Provider,
    authenticatedCoreProvider?: CoreProvider,
    authenticatedConnector?: Connector,
    from?: AddressString,
    onHash?: (hash: ResponseHash) => void,
    bypassMobile = false,
) {
    const [error, setError] = React.useState<CustomError | Error>();
    const [rejected, setRejected] = React.useState<boolean>(false);

    const { screen } = useDimensions();

    const [hash, setHash] = React.useState<ResponseHash>();

    const prevHash = usePrevious(hash);

    const clear = React.useCallback(() => {
        setError(undefined);
        setRejected(false);
        setHash(undefined);
    }, [setError, setRejected, setHash]);

    React.useEffect(() => {
        if (hash && !prevHash && onHash) onHash(hash);
    }, [hash, prevHash, onHash]);

    const addToast = client.toast.useAddToast();
    const toasts = client.toast.useList();

    const estimation = useEstimateTransaction(network, from);

    const [pop, setPop] = React.useState<SimpleTransactionData>();

    /// /////////////////////////
    // this is here just to see if we can find the hash based on event data
    /// /////////////////////////
    emitter.hook.useOn({
        type: emitter.events.PotentialTransactionReceipt,
        callback: React.useCallback(
            (arg) => {
                if (
                    (hash === undefined || arg.txhash !== hash) &&
                    pop &&
                    arg.validate(pop.from, pop.data)
                ) {
                    setHash(arg.txhash);
                }
            },
            [hash, setHash, pop],
        ),
    });

    const blocknum = client.block.useBlock();

    useCheckEtherscanForUnknownTransactionHash(hash, setHash, setError, pop);

    const send = useCallback(
        async (
            ptx: Promise<PopulatedTransaction>,
            onSend?: () => void,
        ): Promise<ResponseHash | undefined> => {
            if (estimation.error) {
                console.error('OOPS - forgot to check for successful estimation');
                return undefined;
            }

            try {
                if (
                    authenticatedConnector &&
                    authenticatedCoreProvider &&
                    authenticatedProvider &&
                    from &&
                    blocknum
                ) {
                    const tx = await ptx;
                    setPop({
                        to: tx!.to as AddressString,
                        from: tx!.from as AddressString,
                        value: tx.value || (BigNumber.from(0) as BigNumber),
                        data: tx!.data as Hash,
                        startBlock: blocknum - 10,
                        sentAt: new Date(),
                    });
                    if (authenticatedConnector.refreshPeer) authenticatedConnector.refreshPeer();

                    return await Promise.all([
                        (authenticatedCoreProvider.type === ConnectorEnum.WalletConnect
                            ? (authenticatedCoreProvider.provider.connector.sendTransaction({
                                  to: tx.to,
                                  from,
                                  type: '2',
                                  value:
                                      tx.value
                                          ?.toHexString()
                                          .replace('0x0', '')
                                          .replace('0x', '') || 0,
                                  data: tx.data,
                              }) as Promise<Hash | null>)
                            : authenticatedProvider.getSigner().sendTransaction(tx)
                        )
                            .then((y) => {
                                emitter.emit({
                                    type: emitter.events.DevLog,
                                    data: y,
                                    name: 'YYYYYYY',
                                });
                                console.log('YYYYYY', y);
                                let txhash: ResponseHash;
                                if (y === null) {
                                    txhash = `unknown-${from}_${tx.data ?? ''}` as ResponseHash;

                                    setHash(txhash);
                                    emitter.emit({
                                        type: emitter.events.PotentialTransactionResponse,
                                        txhash,
                                        from,
                                    });
                                } else if (typeof y === 'string') {
                                    // txhash = `unknown-${from}_${tx.data ?? ''}`;
                                    txhash = y;
                                    setHash(y);
                                    emitter.emit({
                                        type: emitter.events.PotentialTransactionResponse,
                                        txhash: y,
                                        from,
                                    });
                                } else {
                                    txhash = y.hash as Hash;
                                    setHash(txhash);
                                    emitter.emit({
                                        type: emitter.events.TransactionResponse,
                                        response: y,
                                    });
                                }
                                if (screen !== 'phone' || bypassMobile) {
                                    addToast({
                                        duration: 0,
                                        title: t`Pending Transaction`,
                                        message: txhash.isHash()
                                            ? shortenTxnHash(txhash)
                                            : 'submitted',
                                        error: false,
                                        id: txhash,
                                        index: toasts.length,
                                        loading: true,
                                        action: () =>
                                            web3.config.gotoEtherscan(
                                                authenticatedProvider.network.chainId,
                                                txhash.isHash() ? 'tx' : 'address',
                                                txhash.isHash() ? txhash : from,
                                            ),
                                    });
                                }
                                return txhash;
                            })
                            .catch((err: Error) => {
                                emitter.emit({
                                    type: emitter.events.DevLog,
                                    data: err,
                                    name: 'catch A',
                                });
                                const fmt = lib.errors.parseJsonRpcError(err);
                                if (fmt instanceof RejectionError) {
                                    setRejected(true);
                                    console.log('transaction rejected by user');
                                    return undefined;
                                }
                                setError(fmt);
                                console.error(fmt);
                                throw fmt;
                            }),
                        onSend ? onSend() : undefined,
                        emitter.emit({
                            type: emitter.events.TransactionSent,
                        }),
                    ]).then((x) => x[0]);
                }
                throw Error('authenticatedConnector, authenticatedProvider, or from is undefined');
            } catch (err) {
                emitter.emit({
                    type: emitter.events.DevLog,
                    data: err,
                    name: 'FINAL CATCH',
                });
                const fmt = lib.errors.parseJsonRpcError(err);
                setError(fmt);
                console.error(fmt);
                return undefined;
            }
        },
        [
            authenticatedProvider,
            authenticatedConnector,
            authenticatedCoreProvider,
            from,
            addToast,
            toasts.length,
            blocknum,
            bypassMobile,
            screen,
            estimation.error,
            setHash,
        ],
    );
    return { send, hash, error, estimation, rejected, clear };
}

export function usePrioritySendTransaction(bypassMobile?: boolean) {
    const connector = web3.hook.usePriorityConnector();
    const network = web3.hook.useNetworkProvider();
    const provider = web3.hook.usePriorityProvider();
    const coreProvider = web3.hook.usePriorityCoreProvider();
    const address = web3.hook.usePriorityAccount();

    return useSendTransaction(
        network,
        provider,
        coreProvider,
        connector,
        address as AddressString,
        undefined,
        bypassMobile,
    );
}

export const useEtherscan = () => {
    const [prov] = React.useState(new CustomEtherscanProvider(web3.config.DEFAULT_CHAIN));
    return prov;
};

export function useCheckEtherscanForUnknownTransactionHash(
    found?: ResponseHash,
    setFound?: (input: Hash) => void,
    setError?: (input: CustomError | Error) => void,
    request?: SimpleTransactionData,
) {
    const etherscan = useEtherscan();

    //     const isInactive = React.useMemo(() => {
    //         if (!setFound || !request || found) return null;
    //         return 5000;
    //     }, [request, found, setFound]);

    // //
    const callback = React.useCallback(() => {
        if (!setFound || !request || (found && found.startsWith('0x'))) return;
        setTimeout(() => {
            // https://docs.etherscan.io/api-endpoints/accounts
            void etherscan.getHistory(request.from, request.startBlock).then((res) => {
                console.log({ res, request });
                res.forEach((element) => {
                    if (
                        element.data === request.data &&
                        element.to === request.to &&
                        element.value.eq(request.value)
                    ) {
                        setFound(element.hash as Hash);
                        if (element.isError && element.errorCode && setError) {
                            setError(lib.errors.parseJsonRpcError(element.errorCode));
                        }
                        emitter.emit({
                            type: emitter.events.TransactionResponse,
                            response: element,
                        });
                    }
                });
            });
        }, 3000);
    }, [etherscan, request, setFound, found, setError]);

    emitter.hook.useOn({
        type: emitter.events.IncomingRpcBlock,
        callback,
    });

    // useInterval(callback, val);

    return null;
}

export function useTransactionManager2(
    network?: CustomWeb3Provider,
    hash?: ResponseHash,
    onResponse?: (response: ResponseHash) => void,
    onReceipt?: (response: Hash) => void,
) {
    const txdata = client.transactions.useTransaction(hash);

    const prevTxdata = usePrevious(txdata);

    const prevHash = usePrevious(hash);

    const handleResponse = client.transactions.useStore((store) => store.handleResponse);
    const replaceToast = client.toast.useReplaceToast();

    React.useEffect(() => {
        if (!prevHash && hash && network) {
            void handleResponse(hash, network);
        }
    }, [hash, prevHash, network, handleResponse]);

    React.useEffect(() => {
        if (txdata && hash) {
            if (!prevTxdata) {
                if (txdata.response && onResponse) onResponse(hash);
                if (txdata.receipt && onReceipt) onReceipt(hash as Hash);
            } else {
                if (
                    txdata.response !== null &&
                    prevTxdata.response !== txdata.response &&
                    onResponse
                )
                    onResponse(hash);
                if (txdata.receipt && !prevTxdata.receipt) {
                    if (onReceipt) {
                        onReceipt(hash as Hash);
                    }
                    /// lol, this always says success
                    const isSuccess = txdata.receipt;
                    replaceToast({
                        id: hash,
                        duration: isSuccess ? 5000 : 0,
                        loading: false,
                        error: !isSuccess,
                        title: isSuccess ? 'Successful Transaction' : 'Transaction Failed',
                    });
                }
            }
        }
    }, [txdata, prevTxdata, onReceipt, onResponse, hash]);

    return txdata;
}
