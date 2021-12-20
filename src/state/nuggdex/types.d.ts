declare namespace NL.Redux.NuggDex {
    type State = {
        recents: string[];
        thumbnails: Dictionary<Thumbnail>;
        success: Success;
        error: Error;
        loading: boolean;
        activeNuggs: string[];
        myNuggs: string[];
        allNuggs: string[];
        viewing: SearchViews;
        searchFilters: Filters;
    };

    type NuggResult = {
        nugg: NL.GraphQL.Fragments.Nugg.Bare;
    };

    type Filters = {
        sort: {
            asc: boolean;
            by: 'eth' | 'id';
        };
        searchValue: string;
    };

    type SearchViews =
        | 'home'
        | 'all nuggs'
        | 'on sale'
        | 'my nuggs'
        | 'recently viewed';

    type Success = 'QUERIED_TOKENS_ON_SALE' | 'GOT_THUMBNAIL';

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
        | 'UNKNOWN';
}
