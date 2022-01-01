declare namespace NL.GraphQL.Fragments.Swap {
    type Full = Omit<NL.GraphQL.Swap<NL.GraphQL.GraphScalars>, '__typename'>;

    type Bare = Pick<Full, 'id' | 'eth' | 'ethUsd'> & {
        owner: NL.GraphQL.Fragments.General.Id;
        leader: NL.GraphQL.Fragments.General.Id;
        offers: NL.GraphQL.Fragments.Offer.Bare[];
        nugg: NL.GraphQL.Fragments.Nugg.Bare;
        endingEpoch?: number;
        epoch: { endblock: string; startblock: string };
        startingEpoch: { endblock: string; startblock: string };
    };

    type Thumbnail = Omit<Bare, 'offers'> & {
        nugg: NL.GraphQL.Fragments.General.Id;
        num: string;
    };
    type ThumbnailActiveSales = Omit<Bare, 'offers'> & {
        nugg: NL.GraphQL.Fragments.General.Id;
        num: string;
        offers: NL.GraphQL.Fragments.General.Id[];
    };

    type NuggId = {
        nugg: NL.GraphQL.Fragments.General.Id;
    };
}
