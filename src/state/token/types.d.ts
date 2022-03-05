declare namespace NL.Redux.Token {
    type State = {
        tokenId?: string | import('@src/lib/constants').ITEM_ID;
        tokenURI?: ReactSVG;
        success: Success;
        error: Error;
        loading: boolean;
    };

    type Success = 'AUCTION_CLAIM_SUMBITTED' | 'SUCCESS' | 'GOT_SWAP_HISTORY';

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
