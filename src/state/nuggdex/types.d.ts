type NuggDexStateType = {
    recents: {
        id: string;
        dotnuggRawCache: `data:image/svg+xml;base64,${string}`;
        activeLoan?:
            | {
                  id: string;
              }
            | undefined;
        activeSwap?:
            | {
                  id: string;
              }
            | undefined;
        offers?:
            | {
                  id: string;
              }[]
            | undefined;
    }[];
    success: NuggDexSuccess | undefined;
    error: NuggDexError | undefined;
    loading: boolean;
    viewing: NuggDexSearchViews;
    searchFilters: NuggDexFilters;
};

type NuggDexNuggResult = {
    nugg: NL.GraphQL.Fragments.Nugg.Bare;
};

type NuggDexFilters = {
    target?: NuggDexSearchViews;
    sort?: {
        asc: boolean;
        by?: 'eth' | 'id';
    };
    searchValue?: string;
};

type NuggDexSearchViews =
    | 'home'
    | 'all nuggs'
    | 'on sale'
    | 'my nuggs'
    | 'recently viewed'
    | 'items on sale';

type NuggDexSuccess = 'QUERIED_TOKENS_ON_SALE' | 'GOT_THUMBNAIL';

type NuggDexError =
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
