declare namespace NL.GraphQL.Fragments.Offer {
    type Full = Omit<NL.GraphQL.Offer<NL.GraphQL.GraphScalars>, '__typename'>;

    type Bare = Pick<Full, 'id' | 'eth' | 'ethUsd' | 'claimed' | 'owner'> & {
        user: NL.GraphQL.Fragments.General.Id;
    };

    type Thumbnail = Bare & {
        swap: NL.GraphQL.Fragments.Swap.Thumbnail;
        _addr?: string
    };
}
