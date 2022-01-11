declare namespace NL.Redux.Swap {
    type State = {
        error: Error;
        lastUpdated: number;
        loading: boolean;
        success: Success;
        status: Status;
    } & NL.GraphQL.Fragments.Swap.Bare;

    type Status = 'over' | 'ongoing' | 'waiting';

    type Success =
        | 'PLACED_BID'
        | 'ADDED_TO_BID'
        | 'AUCTION_CLAIM_SUMBITTED'
        | 'SUCCESS'
        | 'GOT_PENDING_TOKEN';

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
        | 'AUC:VNB:0'
        | 'EPC:SBL'
        | 'EPC:GBL:0'
        | 'EPC:GBL:1'
        | 'UNKNOWN'
        | 'GAS_ERROR';
}
