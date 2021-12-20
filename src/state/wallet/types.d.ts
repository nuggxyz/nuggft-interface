declare namespace NL.Redux.Wallet {
    interface State {
        error: Error;
        success: Success;
        loading: boolean;
        userShares: number;
    }

    type Success =
        | 'SUCCESS'
        | 'LINKED_ACCOUNT'
        | 'DEPOSIT_SUCCESS'
        | 'SWAP_SUCCESS'
        | 'APPROVE_SUCCESS'
        | 'COMPOUND_SUCCESS'
        | 'WITHDRAW_SUCCESS'
        | 'TRANSFER_SUCCESS'
        | 'ADDED_TO_BID'
        | 'STAKE_STATE_RECIEVED'
        | 'STAKE_POSITION_RECIEVED';

    type Error =
        | 'ERROR_LINKING_ACCOUNT'
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
        | 'AUC:VNB:0'
        | 'ERROR_GETTING_GQL'
        | 'UNKNOWN';
}
