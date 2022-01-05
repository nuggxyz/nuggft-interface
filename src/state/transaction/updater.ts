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
                setTimeout(
                    () =>
                        TransactionState.dispatch.finalizeTransaction({
                            hash: txn,
                            successful: result.status ? true : false,
                        }),
                    500,
                );
            });
        }
    }, [library, txn]);

    return null;
};
