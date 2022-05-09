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
    RpcRotate,
} from '@src/interfaces/events';
import { OfferData } from '@src/client/interfaces';
import { RevertError } from '@src/lib/errors';

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

interface EmitTransactionReceipt extends EmitEventBase {
    type: EmitEventNames.TransactionReceipt;
    recipt: TransactionReceipt;
}

interface EmitPotentialTransactionReceipt extends EmitEventBase {
    type: EmitEventNames.PotentialTransactionReceipt;
    from: AddressString | null;
    to: AddressString;
    log: Log;
    txhash: Hash;
    success: boolean;
    error?: RevertError;
    validate: (from: AddressString, data: Hash) => boolean;
}

interface EmitTransactionResponse extends EmitEventBase {
    type: EmitEventNames.TransactionResponse;
    response: TransactionResponse;
}

interface EmitPotentialTransactionResponse extends EmitEventBase {
    type: EmitEventNames.PotentialTransactionResponse;
    txhash: Hash;
    from: AddressString;
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

interface EmitLocalRpcRotate extends EmitEventBase, EmitOnChainEventBase {
    type: EmitEventNames.Rotate;
    event: RpcRotate;
}

/*  EXPORTS: must be manually updated  */

export enum EmitEventNames {
    PotentialTransactionReceipt = 'local.PotentialTransactionReceipt',
    PotentialTransactionResponse = 'local.PotentialTransactionResponse',
    TransactionReceipt = 'local.TransactionReceipt',
    TransactionResponse = 'local.TransactionResponse',
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
    Rotate = 'local.rpc.event.Rotate',
    // Sell = 'local.rpc.event.Sell',
}

export type EmitEventsListPayload =
    | BuildPayload<EmitTransactionReceipt>
    | BuildPayload<EmitTransactionResponse>
    | BuildPayload<EmitPotentialTransactionResponse>
    | BuildPayload<EmitPotentialTransactionReceipt>
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
    | BuildPayload<EmitLocalRpcRotate>
    // | BuildPayload<EmitRpcSell>
    | BuildPayload<EmitModalOpen>;

export type EmitEventsListCallback =
    | BuildCallback<EmitTransactionReceipt>
    | BuildCallback<EmitPotentialTransactionReceipt>
    | BuildCallback<EmitPotentialTransactionResponse>
    | BuildCallback<EmitTransactionResponse>
    | BuildCallback<EmitLocalRpcMint>
    | BuildCallback<EmitLocalRpcMint>
    | BuildCallback<EmitLocalRpcOffer>
    | BuildCallback<EmitLocalRpcStake>
    | BuildCallback<EmitLocalRpcClaim>
    | BuildCallback<EmitLocalRpcClaimItem>
    | BuildCallback<EmitLocalRpcLoan>
    | BuildCallback<EmitLocalRpcLiquidate>
    | BuildCallback<EmitLocalRpcRebalance>
    | BuildCallback<EmitLocalRpcRotate>
    | BuildCallback<EmitLocalRpcTransfer>
    | BuildCallback<EmitTransactionSent>
    | BuildCallback<EmitKeyboardClosed>
    | BuildCallback<EmitModalOpen>;
