enum TokenType {
    Nugg = 'nugg',
    Item = 'item',
}

declare type NuggId = `${TokenType.Nugg}-${number}`;
declare type ItemId = `${TokenType.Item}-${number}`;
declare type TokenId = ItemId | NuggId;

interface TokenIdAsType<T extends TokenType> {
    tokenId: PickFromTokenType<T, NuggId, ItemId>;
    ___undefined__?: PickFromTokenId<
        this['tokenId'],
        typeof TokenType['Nugg'],
        typeof TokenType['Item']
    >;
}
interface Splitter<N, I> {
    nugg: N;
    item: I;
}
declare type IdPrefix = TokenType;

declare function IdFixture<K extends TokenType, T extends `${K}`>(
    what: T,
): T extends infer R ? (R extends K ? TokenType[R] : never) : never;

declare function IsIdFixture<K extends TokenType, T extends `${K}`>(
    what: T,
): T extends infer R ? (R extends K ? this is TokenType[R] : never) : never;
declare function EnsureIdFixture<K extends TokenType, T extends `${K}`>(
    what: T,
): T extends infer R ? (R extends K ? TokenType[R] : undefined) : undefined;

declare type PickTokenId<T extends IdPrefix> = T extends infer R
    ? R extends TokenType
        ? Entities[R]
        : never
    : never;

declare type PickFromTokenType<T extends TokenType, N, I> = T extends infer R
    ? R extends TokenType
        ? Splitter<N, I>[R]
        : never
    : never;

declare type PickFromTokenId<T extends TokenId, N, I> = T extends `${infer R}-${number}`
    ? R extends TokenType
        ? Splitter<N, I>[R]
        : never
    : never;
