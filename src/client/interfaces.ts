import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { State, StoreApi, UseBoundStore } from 'zustand';
import { ApolloClient } from '@apollo/client/core/ApolloClient';

import { Chain, Connector } from '@src/web3/core/interfaces';
import { SupportedLocale } from '@src/lib/i18n/locales';
import { FeedMessage } from '@src/interfaces/feed';

import { NuggftV1 } from '../typechain/NuggftV1';

// eslint-disable-next-line import/no-cycle

import { TokenId, NuggId, ItemId, ViewRoutes, SwapRoutes } from './router';

export interface BaseOfferData {
    user: string;
    eth: EthInt;
    txhash?: string;
    type: 'nugg' | 'item';
    isBackup: boolean;
}

export interface ItemOfferData extends BaseOfferData {
    type: 'item';
    user: string;
    eth: EthInt;
    sellingNuggId: string;
}

export interface NuggOfferData extends BaseOfferData {
    type: 'nugg';
    user: string;
    eth: EthInt;
}

export type OfferData = ItemOfferData | NuggOfferData;

export enum ListDataTypes {
    Basic = 'basic',
    Swap = 'swap',
}

export interface ListDataBase {
    id: TokenId;
    listDataType: ListDataTypes;
    dotnuggRawCache?: Base64EncodedSvg;
}

export interface BasicData {
    id: TokenId;
    listDataType: ListDataTypes.Basic;
    dotnuggRawCache?: Base64EncodedSvg;
}

export interface SwapData extends ListDataBase {
    id: TokenId;
    listDataType: ListDataTypes.Swap;
    type: 'nugg' | 'item';
    tokenId: this['id'];
    eth: EthInt;
    started: boolean;
    sellingNugg?: string;
    endingEpoch: number | null;
    isCurrent: boolean;
    dotnuggRawCache: undefined;
    over: boolean;
    leader?: string;
}

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
        itemId: ItemId;
        endingEpoch: number | null;
        eth: BigNumberish | undefined;
        sellingNuggId: NuggId;
    }[];
}
export interface BaseUnclaimedOffer {
    type: 'nugg' | 'item';
    tokenId: NuggId | ItemId;
    endingEpoch: number | null;
    eth: EthInt;
    leader: boolean;
    claimParams: {
        address: string;
        tokenId: string;
    };
}
export interface UnclaimedNuggOffer extends BaseUnclaimedOffer {
    type: 'nugg';
    tokenId: NuggId;
    claimParams: {
        address: string;
        tokenId: NuggId;
    };
}
export interface UnclaimedItemOffer extends BaseUnclaimedOffer {
    type: 'item';
    tokenId: ItemId;
    nugg: NuggId;
    claimParams: {
        address: NuggId;
        tokenId: string;
    };
}

export type UnclaimedOffer = UnclaimedNuggOffer | UnclaimedItemOffer;

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
    nuggft: NuggftV1 | undefined;
    manualPriority: Connector | undefined;
    route: string | undefined;
    lastView: ViewRoutes | undefined;
    lastSwap: SwapRoutes | undefined;
    isViewOpen: boolean;
    stake: StakeData | undefined;
    epoch__id: number | undefined;
    epoch: EpochData | undefined;
    nextEpoch: EpochData | undefined;
    blocknum: number | undefined;
    liveOffers: Dictionary<OfferData[]>;
    activeSwaps: SwapData[];
    activeItems: SwapData[];
    potentialItems: SwapData[];
    potentialSwaps: SwapData[];
    myNuggs: MyNuggsData[];
    recentSwaps: SwapData[];
    recentItems: SwapData[];
    myUnclaimedNuggOffers: UnclaimedNuggOffer[];
    myUnclaimedItemOffers: UnclaimedItemOffer[];
    editingNugg: NuggId | undefined;
    myLoans: LoanData[];
    myRecents: Set<string>;
    error: Error | undefined;
    activating: boolean;
    liveTokens: Dictionary<LiveTokenWithLifecycle>;
    darkmode: DarkModePreferences;
    locale: SupportedLocale | undefined;
    searchFilter: SearchFilter;
    feedMessages: FeedMessage[];
    health: Health;
}

export interface Health {
    lastBlockRpc: number | null;
    lastBlockGraph: number | null;
}

export type ClientStateUpdate = {
    manualPriority?: Connector;
    // route?: string;
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
    activeSwaps?: SwapData[];
    activeItems?: SwapData[];
    recentSwaps?: SwapData[];
    recentItems?: SwapData[];
    potentialItems?: SwapData[];
    potentialSwaps?: SwapData[];
    error?: Error;
    activating?: boolean;
    myNuggs?: MyNuggsData[];
    editingNugg?: NuggId | null;
    myUnclaimedNuggOffers?: UnclaimedNuggOffer[];
    myUnclaimedItemOffers?: UnclaimedItemOffer[];
    myLoans?: LoanData[];
    health?: MakeOptional<Health, keyof Health>;
};

export interface Actions {
    updateBlocknum: (blocknum: number, chainId: Chain) => void;
    updateProtocol: (stateUpdate: ClientStateUpdate) => void;
    routeTo: (tokenId: TokenId, view: boolean) => void;
    toggleView: () => void;
    updateOffers: (tokenId: TokenId, offers: OfferData[]) => void;
    removeLoan: (tokenId: NuggId) => void;
    removeNuggClaim: (tokenId: NuggId) => void;
    removeItemClaimIfMine: (buyingNuggId: NuggId, itemId: ItemId) => void;
    addNuggClaim: (update: UnclaimedNuggOffer) => void;
    addItemClaim: (update: UnclaimedItemOffer) => void;
    addLoan: (update: LoanData) => void;
    updateLoan: (update: LoanData) => void;
    addNugg: (update: MyNuggsData) => void;
    removeNugg: (tokenId: NuggId) => void;
    toggleEditingNugg: (tokenId: NuggId | undefined) => void;
    start: (chainId: Chain, rpc: JsonRpcProvider, graph: ApolloClient<any>) => Promise<void>;
    updateToken: (tokenId: TokenId, data: LiveToken) => void;
    updateLocale: (locale: SupportedLocale | undefined) => void;
    updateSearchFilterTarget: (value: SearchFilter['target']) => void;
    updateSearchFilterSort: (value: SearchFilter['sort']) => void;
    updateSearchFilterSearchValue: (value: SearchFilter['searchValue']) => void;
    updateSearchFilterViewing: (value: SearchFilter['viewing']) => void;
    updateUserDarkMode: (value: Theme | undefined) => void;
    updateMediaDarkMode: (value: Theme | undefined) => void;
    addFeedMessage: (update: FeedMessage) => void;
}

export type ClientStore = StoreApi<ClientState> & UseBoundStore<ClientState>;

export interface LiveSwapBase {
    type: 'nugg' | 'item';
    id: string;
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

export interface LiveNuggItem {
    id: string;
    activeSwap: string | undefined;
    feature: number;
    position: number;
}

export interface LiveNugg {
    type: 'nugg';
    activeLoan: boolean | null;
    activeSwap?: LiveNuggSwap;
    items: LiveNuggItem[];
    pendingClaim: boolean | null;
    lastTransfer: number | null;
    owner: string;
    swaps: LiveNuggSwap[];
    isBackup: boolean;
}

export interface LiveItemSwap extends LiveSwapBase {
    type: 'item';
    id: string;
    epoch: EpochData | null;
    eth: EthInt;
    leader: string;
    owner: string | null;
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

export interface LiveItem {
    type: 'item';
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

export type LiveToken = LiveNugg | LiveItem;

export type LiveItemWithLifecycle = LiveItem & { lifecycle: Lifecycle };
export type LiveNuggWithLifecycle = LiveNugg & { lifecycle: Lifecycle };

export type LiveTokenWithLifecycle = LiveNuggWithLifecycle | LiveItemWithLifecycle;
