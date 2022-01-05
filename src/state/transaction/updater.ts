import { useEffect } from 'react';

import Web3State from '../web3';
import { isUndefinedOrNullOrObjectEmpty } from '../../lib';

import TransactionState from '.';

export default () => {
    const { library } = Web3State.hook.useActiveWeb3React();
    const txn = TransactionState.select.txn();

    useEffect(() => {
        if (!isUndefinedOrNullOrObjectEmpty(library)) {
            library.once(txn, (result) => {
                TransactionState.dispatch.finalizeTransaction({
                    hash: txn,
                    successful: result.status ? true : false,
                });
            });
        }
    }, [library, txn]);

    return null;
};
