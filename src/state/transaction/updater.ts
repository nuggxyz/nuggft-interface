import { useCallback, useEffect, useMemo } from 'react';

import { retry, RetryableError, RetryOptions } from '../../lib/retry';
import Web3State from '../web3';
import ProtocolState from '../protocol';

import TransactionState from '.';

interface TxInterface {
    addedTime: number;
    receipt?: Record<string, any>;
    lastCheckedBlockNumber?: number;
}

export function shouldCheck(lastBlockNumber: number, tx: TxInterface): boolean {
    if (tx.receipt) return false;
    if (!tx.lastCheckedBlockNumber) return true;
    const blocksSinceCheck = lastBlockNumber - tx.lastCheckedBlockNumber;
    if (blocksSinceCheck < 1) return false;
    const minutesPending = (new Date().getTime() - tx.addedTime) / 1000 / 60;
    if (minutesPending > 60) {
        // every 10 blocks if pending for longer than an hour
        return blocksSinceCheck > 9;
    } else if (minutesPending > 5) {
        // every 3 blocks if pending more than 5 minutes
        return blocksSinceCheck > 2;
    } else {
        // otherwise every block
        return true;
    }
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
    n: 10,
    minWait: 250,
    maxWait: 10000,
};

export default () => {
    const { library } = Web3State.hook.useActiveWeb3React();

    const lastBlockNumber = ProtocolState.select.currentBlock();

    const txs = TransactionState.select.txs();

    const transactions = useMemo(() => txs ?? {}, [txs]);

    // speed up popup dismisall time if on L2
    const isL2 = false;

    const getReceipt = useCallback(
        (hash: string) => {
            if (!library) throw new Error('No library or chainId');
            const retryOptions = DEFAULT_RETRY_OPTIONS;
            return retry(
                () =>
                    library
                        .getTransactionReceipt(hash)
                        .then((receipt) => {
                            if (receipt === null) {
                                console.debug('Retrying for hash', hash);
                                // DANNY this is the error it keeps hitting.. i think that it is correckly hitting it at the beggiining, bc essentially what it is logically doing is waiting for a receipt to be returned true, which indiicaates a confiremed transaxtion - however i think it does not check again after the first couple of seconds
                                throw new RetryableError();
                            }
                            return receipt;
                        })
                        .catch((err) => console.log('err', err)),
                retryOptions,
            );
        },
        [library],
    );

    useEffect(() => {
        if (!library || !lastBlockNumber) return;

        const cancels = Object.keys(transactions)
            .filter((hash) => shouldCheck(lastBlockNumber, transactions[hash]))
            .map((hash) => {
                const { promise, cancel } = getReceipt(hash);
                promise
                    .then((receipt) => {
                        if (receipt) {
                            TransactionState.dispatch.finalizeTransaction({
                                hash,
                                receipt: {
                                    blockHash: receipt.blockHash,
                                    blockNumber: receipt.blockNumber,
                                    contractAddress: receipt.contractAddress,
                                    from: receipt.from,
                                    status: receipt.status,
                                    to: receipt.to,
                                    transactionHash: receipt.transactionHash,
                                    transactionIndex: receipt.transactionIndex,
                                } as NL.TransactionReceipt,
                            });

                            // the receipt was fetched before the block, fast forward to that block to trigger balance updates
                            if (receipt.blockNumber > lastBlockNumber) {
                                ProtocolState.dispatch.setCurrentBlock(
                                    receipt.blockNumber,
                                );
                            }
                        } else {
                            TransactionState.dispatch.checkedTransaction({
                                hash,
                                blockNumber: lastBlockNumber,
                            });
                        }
                    })
                    .catch((error) => {
                        if (!error.isCancelledError) {
                            console.error(
                                `Failed to check transaction hash: ${hash}`,
                                error,
                            );
                        }
                    });
                return cancel;
            });

        return () => {
            cancels.forEach((cancel) => cancel());
        };
    }, [library, transactions, lastBlockNumber, getReceipt, isL2]);

    return null;
};
