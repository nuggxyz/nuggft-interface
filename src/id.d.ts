enum TokenType {
    Nugg = 'nugg',
    Item = 'item',
}

declare type NuggId = `${'nugg'}-${number}`;
declare type ItemId = `${'item'}-${number}`;
declare type TokenId = ItemId | NuggId;

declare type PickFromTokenTypeSimple<T extends IdPrefix, N, I> = T extends infer R
    ? R extends IdPrefix
        ? Splitter<N, I>[R]
        : never
    : never;

// interface TokenIdAsType<T extends TokenType> {
//     type: T;
//     tokenId: PickFromTokenType<T, NuggId, ItemId>;
// }
interface Splitter<N, I> {
    nugg: N;
    item: I;
}
declare type IdPrefix = 'nugg' | 'item';

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

declare type PickTokenIdSimple<T extends IdPrefix> = T extends infer R
    ? R extends IdPrefix
        ? Splitter<'nugg', 'item'>[R]
        : never
    : never;

declare type PickFromTokenType<T extends TokenType, N, I> = T extends infer R
    ? R extends TokenType
        ? Splitter<N, I>[R]
        : never
    : never;

declare type PickFromTokenId<T extends TokenId, N, I> = T extends `${infer R}-${number}`
    ? R extends keyof Splitter
        ? Splitter<N, I>[R]
        : never
    : never;

interface TokenDiff {
    tokenId: TokenId;
    type: 'nugg' | 'item';
    isItem: () => this is ItemDiff;
    isNugg: () => this is NuggDiff;
}

interface NuggDiff extends TokenDiff {
    type: 'nugg';
    tokenId: NuggId;
}
interface ItemDiff extends TokenDiff {
    type: 'item';
    tokenId: ItemId;
}

type IdDiff<A extends TokenDiff, B, C> = (B & NuggDiff & A) | (C & ItemDiff & A);
