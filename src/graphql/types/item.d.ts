declare namespace NL.GraphQL.Fragments.Item {
    type Full = Omit<NL.GraphQL.Item<NL.GraphQL.GraphScalars>, '__typename'>;

    type ThumbnailFull = Pick<Full, 'id' | 'swaps' | 'activeSwap' | 'dotnuggRawCache' | 'feature'>;

    type Thumbnail = Pick<Full, 'id' | 'swaps' | 'dotnuggRawCache' | 'feature' | 'activeSwap'>;
}
