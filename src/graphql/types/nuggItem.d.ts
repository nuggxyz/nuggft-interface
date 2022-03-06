declare namespace NL.GraphQL.Fragments.NuggItem {
    type Full = Omit<NL.GraphQL.NuggItem<NL.GraphQL.GraphScalars>, '__typename'>;

    type Thumbnail = Pick<Full, 'activeSwap' | 'nugg' | 'id' | 'swaps'> & {
        item: NL.GraphQL.Fragments.Item.Thumbnail;
    };
}
