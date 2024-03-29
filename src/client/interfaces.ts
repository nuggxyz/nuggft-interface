import { Web3Provider } from '@ethersproject/providers';
import { State } from 'zustand';

import { Connector } from '@src/web3/core/interfaces';
import { SupportedLocale } from '@src/lib/i18n/locales';
import { Chain } from '@src/web3/constants';

import { SwapRoutes } from './router';

interface OfferDataBase extends TokenIdFactoryBase {
	eth: BigNumber;
	txhash: string | null;
	isBackup: boolean;
	sellingTokenId: null | NuggId;
	account: unknown;
	incrementX64?: BigNumber;
	agencyEpoch: number | null;
}

export type OfferData = TokenIdFactoryCreator<
	OfferDataBase,
	{ sellingTokenId: null; account: AddressString },
	{ sellingTokenId: NuggId; account: NuggId }
>;

export interface ListDataBase extends TokenIdFactoryBase {
	listDataType: 'swap' | 'basic';
	dotnuggRawCache?: Base64EncodedSvg;
}

export interface BasicData extends ListDataBase {
	listDataType: 'basic';
	dotnuggRawCache?: Base64EncodedSvg;
}

interface SwapDataBase extends ListDataBase {
	listDataType: 'swap';
	eth: BigNumber;
	endingEpoch: number | null;
	canceledEpoch: number | null;
	startUnix?: number;
	leader?: unknown;
	owner: unknown;
	num: number | null;
	bottom: BigNumber;
	isBackup: boolean;
	count?: unknown;
	isTryout?: unknown;
	offers: OfferData[];
	isPotential?: never;
	commitBlock: number | null;
	numOffers: number;
	isV2?: never;
}

export type SwapData = TokenIdFactoryCreator<
	SwapDataBase,
	{ leader?: AddressString; owner: AddressString },
	{ leader?: NuggId; owner: NuggId; count: number; isTryout: boolean }
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
	items: LiveNuggItem[];
	unclaimedOffers: {
		itemId: ItemId | null;
		endingEpoch: number | null;
		eth: BigNumberish | undefined;
		sellingNuggId: NuggId | null;
	}[];
}

export interface UnclaimedOfferBase extends TokenIdFactoryBase {
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
	Pending = 'Pending',
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

export type ClientStateUpdate = {
	manualPriority?: Connector;

	error?: Error;
	activating?: boolean;
	editingNugg?: NuggId | null;
};

export type SearchResults = BasicData[];

export type Dimensions = { height: number; width: number };

export interface Live extends TokenIdFactoryBase {
	activeSwap?: SwapData;
}

export interface LiveNuggItem extends ItemIdFactory<TokenIdFactoryBase> {
	activeSwap: string | undefined;
	feature: number;
	position: number;
	count: number;
	displayed: boolean;
}

export interface LiveNugg extends NuggIdFactory<Live> {
	activeLoan: boolean | null;
	activeSwap?: IsolateNuggIdFactory<SwapData>;
	items: LiveNuggItem[];
	pendingClaim: boolean | null;
	lastTransfer: number | null;
	owner: AddressString;
	swaps: IsolateNuggIdFactory<SwapData>[];
	isBackup: boolean;
}

export type TryoutData = { nugg: NuggId; eth: BigNumber };

export interface LiveItem extends ItemIdFactory<Live> {
	activeSwap?: IsolateItemIdFactory<SwapData>;
	swaps: IsolateItemIdFactory<SwapData>[];
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
	GrandStands = 'grandstands', // [nugg/item] a token that has no active swap AND the priority user ownes it
	Bench = 'bench', //   [nugg/item] a token that is for sale, but no one has bid on it
	Deck = 'deck', //     [nugg/item] a token that is for sale, someone has bid on it, but it is not yet the final epoch
	Bat = 'bat', //       [nugg/item] a token that is for sale, and it is in the final epoch
	Bunt = 'bunt', //     [nugg     ] a token in its final epoch, but has no leader - only for minting nuggs
	Shower = 'shower', // [nugg/item] active swap exists, but none of the others hit. ** i honestly dont even think it can hit this bc the graph catches it
	Tryout = 'tryout', // [     item] a token that has no active sale, but one to many non-active sales
	Cut = 'cut', //       [nugg     ] a token that no one bid on but still exists in the graph
	Egg = 'egg', //       [nugg     ] a token that will be minting in the next epoch --- SAME AS DECK, BUT NON OFFERABLE
	Concessions = 'concessions', // [nugg item] a nugg that is being sold by the user viewing it and no one else has bid on it - same as bench but not offerable by the given user
	Minors = 'minors', // [nugg     ] a nugg that has been preminted and is waiting for a bid
	Formality = 'formality',
}

// }

export type LiveToken = LiveNugg | LiveItem;

export interface Actions {
	setLastSwap: (tokenId: TokenId | undefined) => void;
	setActiveSearch: (input: SearchResults | undefined) => void;
	updateOffers: (tokenId: TokenId, offers: OfferData[]) => void;
	setPageIsLoaded: () => void;
	updateToken: (tokenId: TokenId, data: LiveToken) => void;
	updateLocale: (locale: SupportedLocale | undefined) => void;
	updateSearchFilterTarget: (value: SearchFilter['target']) => void;
	updateSearchFilterSort: (value: SearchFilter['sort']) => void;
	updateSearchFilterSearchValue: (value: SearchFilter['searchValue']) => void;
	updateSearchFilterViewing: (value: SearchFilter['viewing']) => void;
	updateUserDarkMode: (value: Theme | undefined) => void;
	updateMediaDarkMode: (value: Theme | undefined) => void;
	updateDimensions: (window: Dimensions) => void;
}

export interface ClientState {
	route: string | undefined;
	lastSwap: SwapRoutes | undefined;
	pageIsLoaded: boolean;
	liveOffers: Dictionary<OfferData[]>;
	editingNugg: NuggId | undefined;
	myLoans: LoanData[];
	myRecents: Set<string>;
	error: Error | undefined;
	activating: boolean;
	liveTokens: TokenIdDictionary<LiveToken>;
	darkmode: DarkModePreferences;
	locale: SupportedLocale | undefined;
	searchFilter: SearchFilter;
	started: boolean;
	activeSearch: SearchResults;
	dimentions: Dimensions;
}

export interface FullClientState extends ClientState, State, Actions {}
