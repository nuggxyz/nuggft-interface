import { Log } from '@ethersproject/providers';

export enum SocketType {
    STAKE = 0,
    OFFER = 1,
    CLAIM = 2,
    MINT = 3,
    BLOCK = 4,
    ITEM_OFFER = 5,
    ITEM_CLAIM = 6,
}

export enum SocketClient {
    INFURA = 0,
    GRAPH = 1,
}

export function formatEventLog(log: Log) {
    return {
        receivedAt: new Date().getTime(),
        txhash: log.transactionHash,
        block: log.blockNumber,
        client: SocketClient.INFURA,
    };
}

export function formatGraphEventLog() {
    return {
        receivedAt: new Date().getTime(),
        txhash: undefined,
        block: undefined,
        client: SocketClient.GRAPH,
    };
}

export function formatBlockLog(log: number) {
    return {
        receivedAt: new Date().getTime(),
        txhash: undefined,
        block: log,
        client: SocketClient.INFURA,
    };
}

export interface BaseSocketInfo {
    type: SocketType;
    receivedAt: number;
    txhash: string;
    block: number;
    client: SocketClient;
}

export interface StakeInfo extends BaseSocketInfo {
    type: SocketType.STAKE;
    staked: string;
    shares: string;
    proto: string;
}

export interface OfferInfo extends BaseSocketInfo {
    type: SocketType.OFFER;
    tokenId: string;
    value: string;
    account: string;
    endingEpoch: string;
}

export interface ItemOfferInfo extends BaseSocketInfo {
    type: SocketType.ITEM_OFFER;
    tokenId: `item-${string}`;
    value: string;
    nugg: string;
    endingEpoch: string;
}

export interface ClaimInfo extends BaseSocketInfo {
    type: SocketType.CLAIM;
    tokenId: string;
}

export interface ItemClaimInfo extends BaseSocketInfo {
    type: SocketType.ITEM_CLAIM;
    tokenId: `item-${string}`;
}

export interface MintInfo extends BaseSocketInfo {
    type: SocketType.MINT;
    tokenId: string;
    amount: string;
}

export interface BlockInfo extends BaseSocketInfo {
    type: SocketType.BLOCK;
}

export type SocketInfo =
    | StakeInfo
    | OfferInfo
    | ClaimInfo
    | MintInfo
    | BlockInfo
    | ItemClaimInfo
    | ItemOfferInfo;
