import { Web3Provider, WebSocketProvider } from '@ethersproject/providers';
import { State, StoreApi, UseBoundStore } from 'zustand';
import { ApolloClient } from '@apollo/client/core/ApolloClient';

import { Chain, Connector } from '@src/web3/core/interfaces';

import { TokenId, NuggId, ItemId, ViewRoutes, SwapRoutes } from './router';

export interface OfferData {
    user: string;
    eth: EthInt;
    txhash: string;
}

export interface ListData {
    id: TokenId;
    // type: 'nugg' | 'item';
    dotnuggRawCache?: Base64EncodedSvg;
}

export interface SwapData extends ListData {
    id: TokenId;
    type: 'nugg' | 'item';
    tokenId: this['id'];
    eth: EthInt;
    started: boolean;
    sellingNugg?: string;
    endingEpoch: number | null;
    isCurrent: boolean;
    dotnuggRawCache: undefined;
}

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
    // svg: Base64EncodedSvg;
    tokenId: NuggId;
    unclaimedOffers: { itemId: ItemId; endingEpoch: number | null }[];
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

export interface ClientState extends State {
    infura: WebSocketProvider | undefined;
    apollo: ApolloClient<any> | undefined;
    manualPriority: Connector | undefined;
    route: string | undefined;
    lastView: ViewRoutes | undefined;
    lastSwap: SwapRoutes | undefined;
    isViewOpen: boolean;
    stake: StakeData | undefined;
    epoch__id: number | undefined;
    epoch: EpochData | undefined;
    blocknum: number | undefined;
    activeOffers: Dictionary<OfferData[]>;
    activeSwaps: SwapData[];
    activeItems: SwapData[];
    myNuggs: MyNuggsData[];
    myUnclaimedNuggOffers: UnclaimedNuggOffer[];
    myUnclaimedItemOffers: UnclaimedItemOffer[];
    myLoans: LoanData[];
    myRecents: Set<string>;
    error: Error | undefined;
    activating: boolean;
}

export const DEFAULT_STATE: ClientState = {
    infura: undefined,
    stake: undefined,
    epoch: undefined,
    epoch__id: 0,
    route: undefined,
    lastView: undefined,
    lastSwap: undefined,
    isViewOpen: false,
    activeSwaps: [],
    activeItems: [],
    activeOffers: {},
    myNuggs: [],
    myUnclaimedNuggOffers: [],
    myUnclaimedItemOffers: [],
    myRecents: new Set(),
    myLoans: [],
    apollo: undefined,
    activating: false,
    blocknum: undefined,
    error: undefined,
    manualPriority: undefined,
};

export type ClientStateUpdate = {
    infura?: WebSocketProvider;
    apollo?: ApolloClient<unknown>;
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
    activeSwaps?: SwapData[];
    activeItems?: SwapData[];
    error?: Error;
    activating?: boolean;
    myNuggs?: MyNuggsData[];
    myUnclaimedNuggOffers?: UnclaimedNuggOffer[];
    myUnclaimedItemOffers?: UnclaimedItemOffer[];
    myLoans?: LoanData[];
};

export interface Actions {
    startActivation: () => () => void;
    updateBlocknum: (blocknum: number, chainId: Chain) => void;
    updateProtocol: (stateUpdate: ClientStateUpdate) => void;
    routeTo: (tokenId: TokenId, view: boolean) => void;
    reportError: (error: Error | undefined) => void;
    toggleView: () => void;
    updateClients: (
        stateUpdate: Pick<ClientStateUpdate, 'infura' | 'apollo'>,
        chainId: Chain,
    ) => Promise<void>;
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
}

export type ClientStore = StoreApi<ClientState> & UseBoundStore<ClientState>;