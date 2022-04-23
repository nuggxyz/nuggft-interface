enum TokenType {
    Nugg = 'nugg',
    Item = 'item',
}

declare type NuggId = `${'nugg'}-${number}`;
declare type ItemId = `${'item'}-${number}`;
declare type TokenId = ItemId | NuggId;

declare interface Splitter<N, I> {
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

// declare type PickFromFactory<T extends TokenIdFactory, N, I> = Splitter<N, I>[T['type']];

declare type PickFromTokenId<T extends TokenId, N, I> = T extends `${infer R}-${number}`
    ? R extends keyof Splitter
        ? Splitter<N, I>[R]
        : never
    : never;

interface TokenIdFactory {
    tokenId: TokenId;
    type: 'nugg' | 'item';
    isItem: () => this is ItemIdFactory;
    isNugg: () => this is NuggIdFactory;
}

interface NuggIdFactory extends TokenIdFactory {
    type: 'nugg';
    tokenId: NuggId;
}

interface ItemIdFactory extends TokenIdFactory {
    type: 'item';
    tokenId: ItemId;
}

type TokenIdFactoryCreator<A extends TokenIdFactory, B, C> =
    | (B & NuggIdFactory & A)
    | (C & ItemIdFactory & A);

type IsolateItemIdFactory<T extends TokenIdFactory> = ItemIdFactory & T;
type IsolateNuggIdFactory<T extends TokenIdFactory> = T & NuggIdFactory;

interface TokenIdDictionary<T extends TokenIdFactory> {
    [x: ItemId]: T & ItemIdFactory;
    [x: NuggId]: T & NuggIdFactory;
}
