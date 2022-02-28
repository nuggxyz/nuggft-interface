declare namespace NL.GraphQL.Fragments.Nugg {
    type Full = Omit<NL.GraphQL.Nugg<NL.GraphQL.GraphScalars>, '__typename'>;

    type Bare = Pick<Full, 'id'> & {
        user: NL.GraphQL.Fragments.General.Id;
        items: NL.GraphQL.Fragments.General.Id[];
        swaps: NL.GraphQL.Fragments.General.Id[];
        activeSwap: NL.GraphQL.Fragments.General.Id;
        activeLoan: NL.GraphQL.Fragments.General.Id;
        offers: NL.GraphQL.Fragments.ItemOffer.Bare[];
    };

    type Thumbnail = Pick<Bare, 'id' | 'activeSwap' | 'user' | 'items' | 'activeLoan'> & {
        swaps: NL.GraphQL.Fragments.Swap.Thumbnail[];
    };

    type ListItem = {
        id: string;
        dotnuggRawCache: string;
        activeLoan?: { id: string };
        activeSwap?: { id: string };
    };
}
