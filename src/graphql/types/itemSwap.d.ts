declare namespace NL.GraphQL.Fragments.ItemSwap {
    type Full = Omit<NL.GraphQL.ItemSwap<NL.GraphQL.GraphScalars>, '__typename'>;

    type Thumbnail = Pick<
        Full,
        'id' | 'endingEpoch' | 'num' | 'eth' | 'ethUsd' | 'owner' | 'leader' | 'sellingNuggItem'
    >;
}
