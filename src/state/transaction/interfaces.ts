export enum TransactionType {
    TOKEN_APPROVE = 0,
    SWAP_START = 1,
    SWAP_CLAIM = 2,
    SWAP_OFFER = 3,
    LOAN_TAKE = 4,
    LOAN_REBALANCE = 5,
    LOAN_PAYOFF = 6,
    TOKEN_MINT = 7,
    STAKE_WITHDRAW = 8,
}

export interface BaseTransactionInfo {
    type: TransactionType;
}

export interface TokenApproveInfo extends BaseTransactionInfo {
    type: 0;
    tokenId: string;
}

export interface SwapStartInfo extends BaseTransactionInfo {
    type: 1;
    tokenId: string;
    amount: string;
}

export interface SwapClaimInfo extends BaseTransactionInfo {
    type: 2;
    tokenId: string;
}

export interface SwapOfferInfo extends BaseTransactionInfo {
    type: TransactionType.SWAP_OFFER;
    tokenId: string;
    amount: string;
}

export interface LoanTakeInfo extends BaseTransactionInfo {
    type: 4;
}

export interface LoanRebalanceInfo extends BaseTransactionInfo {
    type: 5;
}
export interface LoanPayoffInfo extends BaseTransactionInfo {
    type: 6;
}
export interface TokenMintInfo extends BaseTransactionInfo {
    type: 7;
}
export interface StakeWithdrawInfo extends BaseTransactionInfo {
    type: 8;
}

export type TransactionInfo =
    | TokenApproveInfo
    | SwapStartInfo
    | SwapClaimInfo
    | SwapOfferInfo
    | LoanTakeInfo
    | LoanRebalanceInfo
    | LoanPayoffInfo
    | TokenMintInfo
    | StakeWithdrawInfo;
