import { Log } from '@ethersproject/providers';

export enum SocketType {
    STAKE = 0,
    OFFER = 1,
    CLAIM = 2,
    MINT = 3,
}

export function formatLog(log: Log) {
    return {
        receivedAt: new Date().getDate(),
        txhash: log.transactionHash,
        block: log.blockNumber,
    };
}

export interface BaseSocketInfo {
    type: SocketType;
    receivedAt: number;
    txhash: string;
    block: number;
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

export type SocketInfo = StakeInfo | OfferInfo | ClaimInfo | MintInfo;
