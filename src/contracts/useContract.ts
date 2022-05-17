import { BaseContract, ContractInterface, PopulatedTransaction, BigNumber } from 'ethers';
import React, { useMemo, useCallback } from 'react';
import { t } from '@lingui/macro';

import type { CustomWeb3Provider } from '@src/web3/classes/CustomWeb3Provider';
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
import useInterval from '@src/hooks/useInterval';
import useDebounce from '@src/hooks/useDebounce';
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
    onHash?: (hash: Hash) => void,
    bypassMobile?: boolean,
) {
    const [error, setError] = React.useState<CustomError | Error>();
    const [rejected, setRejected] = React.useState<boolean>(false);

    const { screen } = useDimensions();

    const [hash, setHash] = React.useState<Hash>();

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

    emitter.hook.useOn({
        type: emitter.events.PotentialTransactionReceipt,
        callback: React.useCallback(
            (arg) => {
                if (hash === undefined && pop && arg.validate(pop.from, pop.data)) {
                    setHash(arg.txhash);
                }
            },
            [hash, setHash, pop],
        ),
    });

    const blocknum = client.live.blocknum();

    useCheckEtherscanForUnknownTransactionHash(hash, setHash, setError, pop);

    const send = useCallback(
        async (
            ptx: Promise<PopulatedTransaction>,
            onSend?: () => void,
        ): Promise<Hash | undefined> => {
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
                        authenticatedCoreProvider.type === ConnectorEnum.WalletConnect
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
                              }) as Promise<Hash>)
                            : authenticatedProvider.getSigner().sendTransaction(tx),
                        onSend ? onSend() : undefined,
                        emitter.emit({
                            type: emitter.events.TransactionSent,
                        }),
                    ])
                        .then(([y]) => {
                            console.log('YYYYYY', y);
                            let txhash: Hash;
                            if (typeof y === 'string') {
                                txhash = y;
                                setHash(y as Hash);
                                emitter.emit({
                                    type: emitter.events.PotentialTransactionResponse,
                                    txhash,
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
                                    message: shortenTxnHash(txhash),
                                    error: false,
                                    id: txhash,
                                    index: toasts.length,
                                    loading: true,
                                    action: () =>
                                        web3.config.gotoEtherscan(
                                            authenticatedProvider.network.chainId,
                                            'tx',
                                            txhash,
                                        ),
                                });
                            }
                            return txhash;
                        })
                        .catch((err: Error) => {
                            const fmt = lib.errors.parseJsonRpcError(err);
                            if (fmt instanceof RejectionError) {
                                setRejected(true);
                                console.log('transaction rejected by user');
                                return undefined;
                            }
                            setError(fmt);
                            console.error(fmt);
                            throw fmt;
                        });
                }
                throw Error('authenticatedConnector, authenticatedProvider, or from is undefined');
            } catch (err) {
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
    const chainId = web3.hook.usePriorityChainId();
    return React.useMemo(() => {
        return new CustomEtherscanProvider(
            web3.config.CHAIN_INFO[chainId || 1].label,
            process.env.NUGG_APP_ETHERSCAN_KEY as string,
        );
    }, [chainId]);
};

export function useCheckEtherscanForUnknownTransactionHash(
    found?: Hash,
    setFound?: (input: Hash) => void,
    setError?: (input: CustomError | Error) => void,
    request?: SimpleTransactionData,
) {
    const etherscan = useEtherscan();

    const isInactive = React.useMemo(() => {
        if (!setFound || !request || found) return null;
        return 5000;
    }, [request, found, setFound]);

    const val = useDebounce(isInactive, 0);

    const callback = React.useCallback(async () => {
        if (!setFound || !request || found) return;

        // https://docs.etherscan.io/api-endpoints/accounts
        const res = await etherscan.getHistory(request.from, request.startBlock);

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
    }, [etherscan, request, setFound, found, setError]);

    useInterval(callback, val);

    return null;
}

export function useTransactionManager2(
    network?: CustomWeb3Provider,
    hash?: Hash,
    onResponse?: (response: Hash) => void,
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
                if (txdata.receipt && onReceipt) onReceipt(hash);
            } else {
                if (
                    txdata.response !== null &&
                    prevTxdata.response !== txdata.response &&
                    onResponse
                )
                    onResponse(hash);
                if (txdata.receipt && !prevTxdata.receipt) {
                    if (onReceipt) {
                        onReceipt(hash);
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
