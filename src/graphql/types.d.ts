type Maybe<T> = T | null;
type InputMaybe<T> = Maybe<T>;
type Exact<T extends { [key: string]: unknown }> = {
    [K in keyof T]: T[K];
};
type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]?: Maybe<T[SubKey]>;
};
type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]: Maybe<T[SubKey]>;
};

declare namespace NL.GraphQL {
    /** All built-in and custom scalars, mapped to their actual values */
    interface Scalars {
        ID: string;
        String: string;
        Boolean: boolean;
        BigNumber: any;
        Fraction: any;
        Fraction2x96: any;
        Fraction2x128: any;
        EthInt: any;
    }
    /** All built-in and custom scalars, mapped to their actual values */
    interface GraphScalars extends Scalars {
        ID: string;
        String: string;
        Boolean: boolean;
        BigNumber: string;
        Fraction: string;
        Fraction2x96: string;
        Fraction2x128: string;
        EthInt: string;
    }

    interface ParsedScalars extends Scalars {
        ID: string;
        String: string;
        Boolean: boolean;
        BigNumber: BigNumber;
        Fraction: Fraction;
        Fraction2x96: Fraction2x96;
        Fraction2x128: Fraction2x128;
        EthInt: EthInt;
    }

    type Protocol<T extends Scalars> = {
        __typename?: 'Protocol';
        id: T['ID'];
        init: T['Boolean'];
        lastBlock: T['BigNumber'];
        epoch: Epoch<T>;
        totalSwaps: T['BigNumber'];
        totalLoans: T['BigNumber'];
        totalUsers: T['BigNumber'];
        totalNuggs: T['BigNumber'];
        totalItems: T['BigNumber'];
        totalItemSwaps: T['BigNumber'];
        genesisBlock: T['BigNumber'];
        interval: T['BigNumber'];
        xnuggUser: User<T>;
        nuggftUser: User<T>;
        nullUser: User<T>;
        xnuggTotalSupply: T['BigNumber'];
        xnuggTotalEth: T['BigNumber'];
        nuggftTotalEth: T['BigNumber'];
        nuggftStakedUsdPerShare: T['BigNumber'];
        nuggftStakedUsd: T['BigNumber'];
        nuggftStakedEthPerShare: T['BigNumber'];
        nuggftStakedEth: T['BigNumber'];
        nuggftStakedShares: T['BigNumber'];
        priceUsdcWeth: T['BigNumber'];
        priceWethXnugg: T['BigNumber'];
        tvlEth: T['BigNumber'];
        tvlUsd: T['BigNumber'];
        defaultActiveNugg?: Maybe<Nugg<T>>;
        activeNuggs: Array<Nugg<T>>;
        activeItems: Array<NuggItem<T>>;
    };

    type Offer<T extends Scalars> = {
        __typename?: 'Offer';
        id: T['ID'];
        swap: Swap<T>;
        user: User<T>;
        eth: T['EthInt'];
        ethUsd: T['EthInt'];
        claimed: T['Boolean'];
        owner: T['Boolean'];
    };

    enum EpochStatus {
        Over = 'OVER',
        Active = 'ACTIVE',
        Pending = 'PENDING',
    }

    type Epoch<T extends Scalars> = {
        __typename?: 'Epoch';
        id: T['ID'];
        startblock: T['BigNumber'];
        endblock: T['BigNumber'];
        status?: EpochStatus;
    };

    type Item<T extends Scalars> = {
        __typename?: 'Item';
        id: T['ID'];
        count: T['BigNumber'];
    };

    type NuggItem<T extends Scalars> = {
        __typename?: 'NuggItem';
        id: T['ID'];
        item: Item<T>;
        nugg: Nugg<T>;
        count: T['BigNumber'];

        // these will always exist together - protocol is here only has a work-around
        activeSwap?: Maybe<ItemSwap<T>>;
        protocol?: Maybe<Protocol<T>>;

        swaps: Array<ItemSwap<T>>;
    };

    type Nugg<T extends Scalars> = {
        __typename?: 'Nugg';
        id: T['ID'];
        idnum: T['BigNumber'];
        user: User;

        // these will always exist together - protocol is here only has a work-around
        activeSwap?: Maybe<Swap<T>>;
        protocol?: Maybe<Protocol<T>>;

        swaps: Array<Swap<T>>;
        items: Array<NuggItem<T>>;
        offers: Array<ItemOffer<T>>;
    };

    type Swap<T extends Scalars> = {
        __typename?: 'Swap';
        id: T['ID'];
        nugg: Nugg<T>;
        offers: Array<Offer<T>>;
        epoch: Epoch<T>;
        endingEpoch: T['BigNumber'];
        eth: T['EthInt'];
        ethUsd: T['EthInt'];
        owner: User<T>;
        leader: User<T>;
    };

    type User<T extends Scalars> = {
        __typename?: 'User';
        id: T['ID'];
        xnugg: T['BigNumber'];
        shares: T['BigNumber'];
        ethin: T['BigNumber'];
        ethout: T['BigNumber'];
        nuggs: Array<Nugg<T>>;
        offers: Array<Offer<T>>;
        loans: Array<Loan<T>>;
        swaps: Array<Swap<T>>;
    };

    type ItemSwap<T extends Scalars> = {
        __typename?: 'ItemSwap';
        id: T['ID'];
        sellingNuggItem: NuggItem<T>;
        offers: Array<ItemOffer<T>>;
        epoch?: Maybe<Epoch<T>>;
        endingEpoch: T['BigNumber'];
        eth: T['EthInt'];
        ethUsd: T['EthInt'];
        owner: Nugg<T>;
        leader?: Maybe<Nugg<T>>;
    };

    type ItemOffer<T extends Scalars> = {
        __typename?: 'ItemOffer';
        id: T['ID'];
        swap: ItemSwap<T>;
        nugg: Nugg<T>;
        eth: T['EthInt'];
        ethUsd: T['EthInt'];
        claimed: T['Boolean'];
        owner: T['Boolean'];
    };

    type _Meta_ = {
        block: _Block_;
        deployment: string;
        hasIndexingError: boolean;
    };

    type _Block_ = {
        hash: string;
        number: number;
    };

    type Loan<T extends Scalars> = {
        __typename?: 'Loan';
        id: T['ID'];
        nugg: Nugg<T>;
        user: User<T>;
        epoch: Epoch<T>;
        endingEpoch: T['BigNumber'];
        feeEth: T['BigNumber'];
        feeUsd: T['BigNumber'];
        protocol?: Maybe<Protocol<T>>;
        liquidated: T['Boolean'];
        liquidatedBy?: Maybe<User<T>>;
        liquidatedForEth: T['BigNumber'];
        liquidatedForUsd: T['BigNumber'];
        eth: T['BigNumber'];
        ethUsd: T['BigNumber'];
    };
}
