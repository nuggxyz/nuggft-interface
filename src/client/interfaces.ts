import { Web3Provider } from '@ethersproject/providers';
import { State, StoreApi, UseBoundStore } from 'zustand';

import { Chain, Connector } from '@src/web3/core/interfaces';
import { SupportedLocale } from '@src/lib/i18n/locales';
import { FeedMessage } from '@src/interfaces/feed';

import { NuggftV1 } from '../typechain/NuggftV1';

import { SwapRoutes } from './router';

interface OfferDataBase extends TokenIdFactory {
    user: AddressString | NuggId;
    eth: EthInt;
    txhash?: string;
    isBackup: boolean;
    sellingTokenId: null | NuggId;
}

export type OfferData = TokenIdFactoryCreator<
    OfferDataBase,
    { sellingTokenId: null; user: AddressString },
    { sellingTokenId: NuggId; user: NuggId }
>;

export interface ListDataBase extends TokenIdFactory {
    listDataType: 'swap' | 'basic';
    dotnuggRawCache?: Base64EncodedSvg;
}

export interface BasicData extends ListDataBase {
    listDataType: 'basic';
    dotnuggRawCache?: Base64EncodedSvg;
}

interface SwapDataBase extends ListDataBase {
    listDataType: 'swap';
    eth: EthInt;
    endingEpoch: number | null;
    dotnuggRawCache: undefined;
    leader?: unknown;
}

export type SwapData = TokenIdFactoryCreator<
    SwapDataBase,
    { leader?: AddressString },
    { leader?: NuggId }
>;

export type ListData = SwapData | BasicData;

export interface LoanData {
    endingEpoch: number;
    eth: EthInt;
    nugg: NuggId;
    startingEpoch: number;
}
export interface DefaultExtraData {
    sender: string;
    chainId: Chain;
    provider: Web3Provider;
}

export interface MyNuggsData {
    activeLoan: boolean;
    activeSwap: boolean;
    tokenId: NuggId;
    recent: boolean;
    pendingClaim: boolean;
    lastTransfer: number;
    unclaimedOffers: {
        itemId: ItemId | null;
        endingEpoch: number | null;
        eth: BigNumberish | undefined;
        sellingNuggId: NuggId | null;
    }[];
}

export interface UnclaimedOfferBase extends TokenIdFactory {
    endingEpoch: number | null;
    eth: EthInt;
    leader: boolean;
    claimParams: unknown;
    nugg: unknown;
}

export type UnclaimedOffer = TokenIdFactoryCreator<
    UnclaimedOfferBase,
    {
        nugg: null;
        claimParams: {
            sellingTokenId: NuggId;
            address: AddressString;
            buyingTokenId: 'nugg-0';
            itemId: 'item-0';
        };
    },
    {
        nugg: NuggId;
        claimParams: {
            sellingTokenId: NuggId;
            address: AddressStringZero;
            buyingTokenId: NuggId;
            itemId: ItemId;
        };
    }
>;

export type StakeData = {
    staked: BigNumber;
    shares: BigNumber;
    eps: EthInt;
};

export type EpochData = {
    startblock: number;
    endblock: number;
    id: number;
    status: 'OVER' | 'ACTIVE' | 'PENDING';
};

export enum Theme {
    DARK,
    LIGHT,
}

export type DarkModePreferences = {
    user: Theme | undefined;
    media: Theme | undefined;
};

export enum SearchView {
    Home = 'Home',
    AllNuggs = 'AllNuggs',
    OnSale = 'OnSale',
    MyNuggs = 'MyNuggs',
    Recents = 'Recents',
    AllItems = 'AllItems',
    Search = 'Search',
}

export type SearchFilter = {
    viewing?: SearchView;
    target?: SearchView;
    sort?: {
        direction?: 'asc' | 'desc';
        by?: 'eth' | 'id';
    };
    searchValue?: string;
};

export interface ClientState extends State, Actions {
    subscriptionQueue: Array<TokenId>;
    nuggft: NuggftV1 | undefined;
    manualPriority: Connector | undefined;
    route: string | undefined;
    lastSwap: SwapRoutes | undefined;
    pageIsLoaded: boolean;
    stake: StakeData | undefined;
    epoch__id: number | undefined;
    epoch: EpochData | undefined;
    nextEpoch: EpochData | undefined;
    blocknum: number | undefined;
    liveOffers: Dictionary<OfferData[]>;
    notableSwaps: SwapData[];
    activeSwaps: SwapData[];
    activeItems: SwapData[];
    potentialItems: SwapData[];
    potentialSwaps: SwapData[];
    myNuggs: MyNuggsData[];
    recentSwaps: SwapData[];
    recentItems: SwapData[];
    myUnclaimedNuggOffers: UnclaimedOffer[];
    myUnclaimedItemOffers: UnclaimedOffer[];
    editingNugg: NuggId | undefined;
    myLoans: LoanData[];
    myRecents: Set<string>;
    error: Error | undefined;
    activating: boolean;
    liveTokens: Dictionary<LiveToken>;
    darkmode: DarkModePreferences;
    locale: SupportedLocale | undefined;
    searchFilter: SearchFilter;
    feedMessages: FeedMessage[];
    health: Health;
    started: boolean;
    activeSearch: SearchResults;
    dimentions: Dimentions;
    totalNuggs: number;
}

export interface Health {
    lastBlockRpc?: number;
    lastBlockGraph?: number;
}

export type ClientStateUpdate = {
    manualPriority?: Connector;
    stake?: {
        staked: BigNumber;
        shares: BigNumber;
        eps: EthInt;
    };
    epoch?: {
        startblock: number;
        endblock: number;
        id: number;
        status: 'OVER' | 'ACTIVE' | 'PENDING';
    };
    nextEpoch?: {
        startblock: number;
        endblock: number;
        id: number;
        status: 'OVER' | 'ACTIVE' | 'PENDING';
    };
    totalNuggs?: number;
    activeSwaps?: ClientState['activeSwaps'];
    activeItems?: ClientState['activeItems'];
    recentSwaps?: ClientState['recentSwaps'];
    recentItems?: ClientState['recentItems'];
    potentialItems?: ClientState['potentialItems'];
    potentialSwaps?: ClientState['potentialSwaps'];
    notableSwaps?: ClientState['notableSwaps'];

    error?: Error;
    activating?: boolean;
    myNuggs?: MyNuggsData[];
    editingNugg?: NuggId | null;
    myUnclaimedNuggOffers?: UnclaimedOffer[];
    myUnclaimedItemOffers?: UnclaimedOffer[];
    myLoans?: LoanData[];
    health?: MakeOptional<Health, keyof Health>;
};

export type SearchResults = BasicData[];

export type Dimentions = { height: number; width: number };

export interface Actions {
    updateBlocknum: (blocknum: number, chainId: Chain, startup?: boolean) => void;
    updateProtocol: (stateUpdate: ClientStateUpdate) => void;
    setLastSwap: (tokenId: TokenId | undefined) => void;
    setActiveSearch: (input: SearchResults | undefined) => void;
    updateOffers: (tokenId: TokenId, offers: OfferData[]) => void;
    removeLoan: (tokenId: NuggId) => void;
    removeNuggClaim: (tokenId: NuggId) => void;
    removeItemClaimIfMine: (buyingNuggId: NuggId, itemId: ItemId) => void;
    addNuggClaim: (update: UnclaimedOffer) => void;
    addItemClaim: (update: UnclaimedOffer) => void;
    addLoan: (update: LoanData) => void;
    updateLoan: (update: LoanData) => void;
    addNugg: (update: MyNuggsData) => void;
    removeNugg: (tokenId: NuggId) => void;
    setPageIsLoaded: () => void;
    updateToken: (tokenId: TokenId, data: LiveToken) => void;
    updateLocale: (locale: SupportedLocale | undefined) => void;
    updateSearchFilterTarget: (value: SearchFilter['target']) => void;
    updateSearchFilterSort: (value: SearchFilter['sort']) => void;
    updateSearchFilterSearchValue: (value: SearchFilter['searchValue']) => void;
    updateSearchFilterViewing: (value: SearchFilter['viewing']) => void;
    updateUserDarkMode: (value: Theme | undefined) => void;
    updateMediaDarkMode: (value: Theme | undefined) => void;
    addFeedMessage: (update: FeedMessage) => void;
    updateDimentions: (window: Dimentions) => void;
    addToSubscritpionQueue: (update: TokenId) => void;
}

export type ClientStore = StoreApi<ClientState> & UseBoundStore<ClientState>;

export interface LiveSwapBase extends TokenIdFactory {
    epoch?: EpochData | null;
    eth: EthInt;
    leader: string;
    owner: string | null;
    endingEpoch: number | null;
    num: number | null;
    bottom: EthInt;
    isBackup: boolean;
}

export interface LiveNuggSwap extends LiveSwapBase {
    type: 'nugg';
    isActive: boolean;
}

export type LiveSwap = LiveNuggSwap | LiveItemSwap;

export interface LiveNuggItem extends ItemIdFactory {
    activeSwap: string | undefined;
    feature: number;
    position: number;
    count: number;
    displayed: boolean;
}

export interface LiveNugg extends NuggIdFactory {
    activeLoan: boolean | null;
    activeSwap?: LiveNuggSwap;
    items: LiveNuggItem[];
    pendingClaim: boolean | null;
    lastTransfer: number | null;
    owner: AddressString;
    swaps: LiveNuggSwap[];
    isBackup: boolean;
}

export interface LiveItemSwap extends LiveSwapBase {
    epoch: EpochData | null;
    eth: EthInt;
    leader: NuggId;
    owner: NuggId | null;
    endingEpoch: number | null;
    num: number;
    isTryout: boolean | null;
    sellingNuggId: NuggId;
    isBackup: boolean;
}

export interface LiveActiveItemSwap extends LiveItemSwap {
    count: number;
}
export type TryoutData = { nugg: NuggId; eth: EthInt };

export interface LiveItem extends ItemIdFactory {
    activeSwap?: LiveActiveItemSwap;
    upcomingActiveSwap?: LiveActiveItemSwap;
    swaps: LiveItemSwap[];
    count: number;
    tryout: {
        count: number;
        swaps: TryoutData[];
        max?: TryoutData;
        min?: TryoutData;
    };
    rarity: Fraction;
    isBackup: boolean;
}

export enum Lifecycle {
    Stands = 'stands', // [nugg/item] a token that has no active swap
    Bench = 'bench', //   [nugg/item] a token that is for sale, but no one has bid on it
    Deck = 'deck', //     [nugg/item] a token that is for sale, someone has bid on it, but it is not yet the final epoch
    Bat = 'bat', //       [nugg/item] a token that is for sale, and it is in the final epoch
    Bunt = 'bunt', //     [nugg     ] a token in its final epoch, but has no leader - only for minting nuggs
    Shower = 'shower', // [nugg/item] active swap exists, but none of the others hit. ** i honestly dont even think it can hit this bc the graph catches it
    Tryout = 'tryout', // [     item] a token that has no active sale, but one to many non-active sales
    Cut = 'cut', //       [nugg     ] a token that no one bid on but still exists in the graph
    Egg = 'egg', //       [nugg     ] a token that will be minting in the next epoch --- SAME AS DECK, BUT NON OFFERABLE
}

// interface LiveT<T extends TokenType> extends TokenIdAsType<T> {
//     activeSwap: LiveActiveItemSwap;
//     upcomingActiveSwap: LiveActiveItemSwap;
//     tryout: PickFromTokenType<
//         T,
//         null,
//         {
//             count: number;
//             swaps: TryoutData[];
//             max?: TryoutData;
//             min?: TryoutData;
//         }
//     >;
//     rarity: PickFromTokenType<T, null, Fraction>;
//     count: PickFromTokenType<T, null, number>;

// }

export type LiveToken = LiveNugg | LiveItem;

// export type LiveItemWithLifecycle = LiveItem & { lifecycle: Lifecycle };
// export type LiveNuggWithLifecycle = LiveNugg & { lifecycle: Lifecycle };

// export type LiveToken = LiveNuggWithLifecycle | LiveItemWithLifecycle;
