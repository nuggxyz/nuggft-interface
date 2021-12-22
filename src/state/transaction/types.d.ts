type base = import('./interfaces').BaseTransactionInfo;
declare namespace NL.Redux.Transaction {
    interface Details {
        hash: string;
        receipt?: SerializableTransactionReceipt;
        lastCheckedBlockNumber?: number;
        addedTime: number;
        confirmedTime?: number;
        from: string;
        info: base;
    }

    interface Response<T extends base> {
        hash: string;
        receipt?: SerializableTransactionReceipt;
        response: TransactionResponse;
        lastCheckedBlockNumber?: number;
        addedTime: number;
        confirmedTime?: number;
        from: string;
        info: T;
    }

    type State = {
        txs: Dictionary<Details>;
        toggleCompletedTxn: boolean;
        success: Success;
        error: Error;
        loading: boolean;
    };

    interface PendingMiddlewareTx {
        _pendingtx: Response<Info>;
        callbackFn?: () => void;
    }

    interface SerializableTransactionReceipt {
        to: string;
        from: string;
        contractAddress: string;
        transactionIndex: number;
        blockHash: string;
        transactionHash: string;
        blockNumber: number;
        status?: number;
    }

    type Map = { [txHash: string]: Details };

    type Success =
        | 'PLACED_BID'
        | 'ADDED_TO_BID'
        | 'REWARD_CLAIMED'
        | 'TX_CHECKED'
        | 'TX_FINALIZED'
        | 'TXS_CLEARED'
        | 'TX_ADDED';

    type Error =
        | 'AUC:PB:0'
        | 'AUC:PB:1'
        | 'AUC:ATB:0'
        | 'AUC:SRTW:0'
        | 'AUC:BID:0'
        | 'AUC:BID:1'
        | 'AUC:BID:2'
        | 'AUC:CLM:0'
        | 'AUC:CLM:1'
        | 'AUC:CLM:2'
        | 'AUC:VATB:0'
        | 'TX_NOT_IN_CACHE'
        | 'TX_EXISTS'
        | 'UNKNOWN';

    interface TxThunkSuccess<T> extends PendingMiddlwareTx {
        success: T;
    }
}
