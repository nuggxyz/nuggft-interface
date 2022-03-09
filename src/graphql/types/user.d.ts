declare namespace NL.GraphQL.Fragments.User {
    type Full = Omit<NL.GraphQL.User<NL.GraphQL.GraphScalars>, '__typename'>;

    type Bare = Pick<Full, 'ethin' | 'ethout' | 'id' | 'xnugg' | 'loans'> & {
        nuggs: (NL.GraphQL.Fragments.General.Id & { offers: any })[];
        offers: NL.GraphQL.Fragments.Offer.Thumbnail[];
    };
    type BareUnclaimed = Pick<Full, 'ethin' | 'ethout' | 'id' | 'xnugg' | 'loans'> & {
        nuggs: (NL.GraphQL.Fragments.General.Id & { offers: any })[];
        unclaimedOffers: NL.GraphQL.Fragments.Offer.Thumbnail[];
    };
}
