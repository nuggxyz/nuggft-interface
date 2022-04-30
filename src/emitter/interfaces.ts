import { Log } from '@ethersproject/providers';

import {
    InterfacedEvent,
    RpcOffer,
    RpcTransfer,
    RpcMint,
    RpcOfferMint,
    RpcStake,
    RpcClaim,
    RpcClaimItem,
    RpcLiquidate,
    RpcLoan,
    RpcRebalance,
    RpcOfferItem,
} from '@src/interfaces/events';
import { OfferData } from '@src/client/interfaces';

/*  BASE: DO NOT CHANGE  */

interface EmitEventBase {
    type: EmitEventNames;
    callback: (arg: Omit<this, 'callback'>) => void;
}

type BuildPayload<T> = Omit<T, 'callback'>;
type BuildCallback<T extends { type: any; callback: any }> = Pick<T, 'type' | 'callback'>;

interface EmitOnChainEventBase {
    event: InterfacedEvent;
    log: Log;
}

/*  INTERFACES: add new ones here  */

interface EmitTransactionCompleted extends EmitEventBase {
    type: EmitEventNames.TransactionComplete;
    txhash: string;
    success: boolean;
}

interface EmitTransactionInitiated extends EmitEventBase {
    type: EmitEventNames.TransactionInitiated;
    txhash: string;
}

interface EmitTransactionSent extends EmitEventBase {
    type: EmitEventNames.TransactionSent;
}

interface EmitKeyboardClosed extends EmitEventBase {
    type: EmitEventNames.KeyboardClosed;
}

interface EmitModalOpen extends EmitEventBase {
    type: EmitEventNames.OfferModalOpened;
    onModalOpen: () => void;
}

interface EmitLocalRpcMint extends EmitEventBase, EmitOnChainEventBase {
    type: EmitEventNames.Mint;
    event: RpcMint | RpcOfferMint;
}

interface EmitLocalRpcOffer extends EmitEventBase, EmitOnChainEventBase {
    type: EmitEventNames.Offer;
    event: RpcOffer | RpcOfferMint;
    data: OfferData;
}

interface EmitLocalRpcTransfer extends EmitEventBase, EmitOnChainEventBase {
    type: EmitEventNames.Transfer;
    event: RpcTransfer;
}

interface EmitLocalRpcStake extends EmitEventBase, EmitOnChainEventBase {
    type: EmitEventNames.Stake;
    event: RpcStake | RpcOffer | RpcOfferMint | RpcMint | RpcOfferItem;
}

interface EmitLocalRpcClaim extends EmitEventBase, EmitOnChainEventBase {
    type: EmitEventNames.Claim;
    event: RpcClaim;
}

interface EmitLocalRpcClaimItem extends EmitEventBase, EmitOnChainEventBase {
    type: EmitEventNames.ClaimItem;
    event: RpcClaimItem;
}
interface EmitLocalRpcLoan extends EmitEventBase, EmitOnChainEventBase {
    type: EmitEventNames.Loan;
    event: RpcLoan;
}

interface EmitLocalRpcLiquidate extends EmitEventBase, EmitOnChainEventBase {
    type: EmitEventNames.Liquidate;
    event: RpcLiquidate;
}

interface EmitLocalRpcRebalance extends EmitEventBase, EmitOnChainEventBase {
    type: EmitEventNames.Rebalance;
    event: RpcRebalance;
}

/*  EXPORTS: must be manually updated  */

export enum EmitEventNames {
    TransactionComplete = 'local.TransactionComplete',
    TransactionInitiated = 'local.TransactionInitiated',
    OfferModalOpened = 'local.OfferModalOpened',
    TransactionSent = 'local.TransactionSent',
    // on chain events
    Mint = 'local.rpc.event.Mint',
    Transfer = 'local.rpc.event.Transfer',
    Offer = 'local.rpc.event.Offer',
    OfferMint = 'local.rpc.event.OfferMint',
    Stake = 'local.rpc.event.Stake',
    Loan = 'local.rpc.event.Loan',
    Liquidate = 'local.rpc.event.Liquidate',
    Rebalance = 'local.rpc.event.Rebalance',
    Claim = 'local.rpc.event.Claim',
    ClaimItem = 'local.rpc.event.ClaimItem',
    KeyboardClosed = 'local.viewport.KeyboardClosed',
    // Sell = 'local.rpc.event.Sell',
}

export type EmitEventsListPayload =
    | BuildPayload<EmitTransactionCompleted>
    | BuildPayload<EmitTransactionInitiated>
    | BuildPayload<EmitLocalRpcMint>
    | BuildPayload<EmitLocalRpcMint>
    | BuildPayload<EmitLocalRpcOffer>
    | BuildPayload<EmitLocalRpcStake>
    | BuildPayload<EmitLocalRpcClaim>
    | BuildPayload<EmitLocalRpcClaimItem>
    | BuildPayload<EmitLocalRpcLoan>
    | BuildPayload<EmitLocalRpcLiquidate>
    | BuildPayload<EmitLocalRpcRebalance>
    | BuildPayload<EmitLocalRpcTransfer>
    | BuildPayload<EmitTransactionSent>
    | BuildPayload<EmitKeyboardClosed>
    | BuildPayload<EmitModalOpen>;

export type EmitEventsListCallback =
    | BuildCallback<EmitTransactionCompleted>
    | BuildCallback<EmitTransactionInitiated>
    | BuildCallback<EmitLocalRpcMint>
    | BuildCallback<EmitLocalRpcMint>
    | BuildCallback<EmitLocalRpcOffer>
    | BuildCallback<EmitLocalRpcStake>
    | BuildCallback<EmitLocalRpcClaim>
    | BuildCallback<EmitLocalRpcClaimItem>
    | BuildCallback<EmitLocalRpcLoan>
    | BuildCallback<EmitLocalRpcLiquidate>
    | BuildCallback<EmitLocalRpcRebalance>
    | BuildCallback<EmitLocalRpcTransfer>
    | BuildCallback<EmitTransactionSent>
    | BuildCallback<EmitKeyboardClosed>
    | BuildCallback<EmitModalOpen>;
