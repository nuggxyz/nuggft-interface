export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
    [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
    BigInt: any;
    Bytes: any;
};

export type Protocol = {
    __typename?: 'Protocol';
    id: Scalars['ID'];
    init: Scalars['Boolean'];
    lastBlock: Scalars['BigInt'];
    epoch: Epoch;
    totalSwaps: Scalars['BigInt'];
    totalLoans: Scalars['BigInt'];
    totalUsers: Scalars['BigInt'];
    totalNuggs: Scalars['BigInt'];
    totalItems: Scalars['BigInt'];
    totalItemSwaps: Scalars['BigInt'];
    genesisBlock: Scalars['BigInt'];
    interval: Scalars['BigInt'];
    xnuggUser: User;
    nuggftUser: User;
    nullUser: User;
    xnuggTotalSupply: Scalars['BigInt'];
    xnuggTotalEth: Scalars['BigInt'];
    nuggftTotalEth: Scalars['BigInt'];
    nuggftStakedUsdPerShare: Scalars['BigInt'];
    nuggftStakedUsd: Scalars['BigInt'];
    nuggftStakedEthPerShare: Scalars['BigInt'];
    nuggftStakedEth: Scalars['BigInt'];
    nuggftStakedShares: Scalars['BigInt'];
    priceUsdcWeth: Scalars['BigInt'];
    priceWethXnugg: Scalars['BigInt'];
    tvlEth: Scalars['BigInt'];
    tvlUsd: Scalars['BigInt'];
    defaultActiveNugg?: Maybe<Nugg>;
    activeNuggs: Array<Nugg>;
    activeItems: Array<NuggItem>;
};

export type Offer = {
    __typename?: 'Offer';
    id: Scalars['ID'];
    swap: Swap;
    user: User;
    eth: Scalars['BigInt'];
    ethUsd: Scalars['BigInt'];
    claimed: Scalars['Boolean'];
    owner: Scalars['Boolean'];
};

export enum EpochStatus {
    Over = 'OVER',
    Active = 'ACTIVE',
    Pending = 'PENDING',
}

export type Epoch = {
    __typename?: 'Epoch';
    id: Scalars['ID'];
    idnum: Scalars['BigInt'];
    startblock: Scalars['BigInt'];
    endblock: Scalars['BigInt'];
    status: EpochStatus;
    _activeSwaps: Array<Scalars['String']>;
    _activeItemSwaps: Array<Scalars['String']>;
};

export type Item = {
    __typename?: 'Item';
    id: Scalars['ID'];
    count: Scalars['BigInt'];
};

export type NuggItem = {
    __typename?: 'NuggItem';
    id: Scalars['ID'];
    item: Item;
    nugg: Nugg;
    count: Scalars['BigInt'];
    protocol?: Maybe<Protocol>;
    activeSwap?: Maybe<ItemSwap>;
    swaps: Array<ItemSwap>;
};

export type Nugg = {
    __typename?: 'Nugg';
    id: Scalars['ID'];
    idnum: Scalars['BigInt'];
    user: User;
    protocol?: Maybe<Protocol>;
    activeSwap?: Maybe<Swap>;
    activeLoan?: Maybe<Loan>;
    burned: Scalars['Boolean'];
    swaps: Array<Swap>;
    items: Array<NuggItem>;
    offers: Array<ItemOffer>;
    loans: Array<Loan>;
};

export type Swap = {
    __typename?: 'Swap';
    id: Scalars['ID'];
    nugg: Nugg;
    offers: Array<Offer>;
    epoch: Epoch;
    endingEpoch?: Maybe<Scalars['BigInt']>;
    eth: Scalars['BigInt'];
    ethUsd: Scalars['BigInt'];
    owner: User;
    leader: User;
};

export type Loan = {
    __typename?: 'Loan';
    id: Scalars['ID'];
    nugg: Nugg;
    user: User;
    epoch: Epoch;
    endingEpoch: Scalars['BigInt'];
    feeEth: Scalars['BigInt'];
    feeUsd: Scalars['BigInt'];
    protocol?: Maybe<Protocol>;
    liquidated: Scalars['Boolean'];
    liquidatedBy?: Maybe<User>;
    liquidatedForEth: Scalars['BigInt'];
    liquidatedForUsd: Scalars['BigInt'];
    eth: Scalars['BigInt'];
    ethUsd: Scalars['BigInt'];
};

export type User = {
    __typename?: 'User';
    id: Scalars['ID'];
    xnugg: Scalars['BigInt'];
    shares: Scalars['BigInt'];
    ethin: Scalars['BigInt'];
    ethout: Scalars['BigInt'];
    nuggs: Array<Nugg>;
    offers: Array<Offer>;
    loans: Array<Loan>;
    swaps: Array<Swap>;
};

export type ItemSwap = {
    __typename?: 'ItemSwap';
    id: Scalars['ID'];
    sellingNuggItem: NuggItem;
    offers: Array<ItemOffer>;
    epochId?: Maybe<Scalars['String']>;
    epoch?: Maybe<Epoch>;
    endingEpoch?: Maybe<Scalars['BigInt']>;
    eth: Scalars['BigInt'];
    ethUsd: Scalars['BigInt'];
    owner: Nugg;
    leader?: Maybe<Nugg>;
};

export type ItemOffer = {
    __typename?: 'ItemOffer';
    id: Scalars['ID'];
    swap: ItemSwap;
    nugg: Nugg;
    eth: Scalars['BigInt'];
    ethUsd: Scalars['BigInt'];
    claimed: Scalars['Boolean'];
    owner: Scalars['Boolean'];
};
