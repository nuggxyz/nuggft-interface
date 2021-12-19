declare namespace NL.GraphQL.Fragments.ItemOffer {
    type Full = Omit<
        NL.GraphQL.ItemOffer<NL.GraphQL.GraphScalars>,
        '__typename'
    >;

    type Bare = Pick<Full, 'claimed' | 'eth' | 'ethUsd' | 'id' | 'owner'> & {
        swap: NL.GraphQL.Fragments.General.Id;
        nugg: NL.GraphQL.Fragments.General.Id;
    };
}
