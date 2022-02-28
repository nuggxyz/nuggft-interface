import { Log } from '@ethersproject/providers';

export enum SocketType {
    STAKE = 0,
    OFFER = 1,
    CLAIM = 2,
    MINT = 3,
    BLOCK = 4,
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

export interface ClaimInfo extends BaseSocketInfo {
    type: SocketType.CLAIM;
    tokenId: string;
}

export interface MintInfo extends BaseSocketInfo {
    type: SocketType.MINT;
    tokenId: string;
    amount: string;
}

export interface BlockInfo extends BaseSocketInfo {
    type: SocketType.BLOCK;
}

export type SocketInfo = StakeInfo | OfferInfo | ClaimInfo | MintInfo | BlockInfo;
