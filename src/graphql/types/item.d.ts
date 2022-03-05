declare namespace NL.GraphQL.Fragments.Item {
    type Full = Omit<NL.GraphQL.Item<NL.GraphQL.GraphScalars>, '__typename'>;

    type Thumbnail = Pick<Full, 'id' | 'swaps' | 'activeSwap'>;
}
