declare namespace NL.GraphQL.Fragments.Protocol {
    type Full = Omit<
        NL.GraphQL.Protocol<NL.GraphQL.GraphScalars>,
        '__typename'
    >;

    type Prices = Pick<
        Full,
        | 'xnuggTotalSupply'
        | 'xnuggTotalEth'
        | 'nuggftTotalEth'
        | 'priceUsdcWeth'
        | 'priceWethXnugg'
        | 'tvlEth'
        | 'tvlUsd'
    >;

    type Actives = {
        defaultActiveNugg: NL.GraphQL.Fragments.General.Id;
        activeItems: NL.GraphQL.Fragments.General.Id[];
        activeNuggs: (NL.GraphQL.Fragments.General.Id & {
            dotnuggRawCache: string;
        })[];
    };

    type Staked = {
        nuggftStakedUsdPerShare: string;
        nuggftStakedUsd: string;
        nuggftStakedEthPerShare: string;
        nuggftStakedEth: string;
        nuggftStakedShares: string;
    };

    type Epochs = Pick<Full, 'interval' | 'epoch'> &
        Staked & { genesisBlock: number };

    type Totals = Pick<
        Full,
        | 'totalSwaps'
        | 'totalUsers'
        | 'totalItemSwaps'
        | 'totalItems'
        | 'totalNuggs'
    >;

    type Users = {
        nuggftUser: NL.GraphQL.Fragments.User.Bare;
        nullUser: NL.GraphQL.Fragments.User.Bare;
        xnuggUser: NL.GraphQL.Fragments.User.Bare;
    };

    type Index = Prices &
        Actives &
        Epochs &
        Totals &
        Users &
        Staked &
        Pick<Full, 'id' | 'init'>;
}
