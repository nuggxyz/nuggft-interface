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
    waitFor?: EmitEventNames;
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
    txhash: ResponseHash;
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

export interface EmitWorkerEventBase extends EmitEventBase {
    type: EmitEventNames;
    data: unknown;
}

interface EmitWorkerIncomingRpcEvent extends EmitEventBase, EmitWorkerEventBase {
    type: EmitEventNames.IncomingRpcEvent;
    data: InterfacedEvent;
    log: Log;
}

interface EmitWorkerIncomingRpcBlock extends EmitEventBase, EmitWorkerEventBase {
    type: EmitEventNames.IncomingRpcBlock;
    data: number;
    log: number;
}

interface EmitWorkerIncomingEtherscanPrice extends EmitEventBase, EmitWorkerEventBase {
    type: EmitEventNames.IncomingEtherscanPrice;
    data: null | number;
}

interface EmitRequestTokenSvgQuery extends EmitEventBase {
    type: EmitEventNames.RequestTokenSvgQuery;
    data: TokenId;
    waitFor?: EmitEventNames.ReturnTokenSvgQuery;
}

interface EmitReturnTokenSvgQuery extends EmitEventBase {
    type: EmitEventNames.ReturnTokenSvgQuery;
    data: string | null;
}

interface EmitHealthCheck extends EmitEventBase {
    type: EmitEventNames.HealthCheck;
}

interface EmitWorkerIsRunning extends EmitEventBase {
    type: EmitEventNames.WorkerIsRunning;
    label: string;
}
interface EmitDevLog extends EmitEventBase {
    type: EmitEventNames.DevLog;
    data: object;
    name: string;
}

/*  EXPORTS: must be manually updated  */

export enum EmitEventNames {
    PotentialTransactionReceipt = 'main.PotentialTransactionReceipt',
    PotentialTransactionResponse = 'main.PotentialTransactionResponse',
    TransactionReceipt = 'main.TransactionReceipt',
    TransactionResponse = 'main.TransactionResponse',
    OfferModalOpened = 'main.OfferModalOpened',
    TransactionSent = 'main.TransactionSent',
    // on chain events
    Mint = 'main.rpc.event.Mint',
    Transfer = 'main.rpc.event.Transfer',
    Offer = 'main.rpc.event.Offer',
    OfferMint = 'main.rpc.event.OfferMint',
    Stake = 'main.rpc.event.Stake',
    Loan = 'main.rpc.event.Loan',
    Liquidate = 'main.rpc.event.Liquidate',
    Rebalance = 'main.rpc.event.Rebalance',
    Claim = 'main.rpc.event.Claim',
    ClaimItem = 'main.rpc.event.ClaimItem',
    KeyboardClosed = 'main.viewport.KeyboardClosed',
    Rotate = 'main.rpc.event.Rotate',
    DevLog = 'dev.log',
    IncomingRpcEvent = 'worker.rpc.event',
    IncomingRpcBlock = 'worker.rpc.block',
    IncomingEtherscanPrice = 'worker.etherscan.price',
    RequestTokenSvgQuery = 'main.graphql.RequestTokenSvgQuery',
    ReturnTokenSvgQuery = 'worker.graphql.ReturnTokenSvgQuery',
    HealthCheck = 'main.health.HealthCheck',
    WorkerIsRunning = 'worker.health.WorkerIsRunning',
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
    | BuildPayload<EmitHealthCheck>
    | BuildPayload<EmitWorkerIsRunning>
    | BuildPayload<EmitWorkerIncomingEtherscanPrice>
    | BuildPayload<EmitDevLog>

    // | BuildPayload<EmitRpcSell>
    | BuildPayload<EmitRequestTokenSvgQuery>
    | BuildPayload<EmitWorkerEventBase>
    | BuildPayload<EmitModalOpen>
    | BuildPayload<EmitReturnTokenSvgQuery>
    | BuildPayload<EmitWorkerIncomingRpcEvent>
    | BuildPayload<EmitWorkerIncomingRpcBlock>;

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
    | BuildCallback<EmitDevLog>
    | BuildCallback<EmitHealthCheck>
    | BuildCallback<EmitLocalRpcTransfer>
    | BuildCallback<EmitTransactionSent>
    | BuildCallback<EmitKeyboardClosed>
    | BuildCallback<EmitModalOpen>
    | BuildCallback<EmitWorkerIsRunning>
    | BuildCallback<EmitRequestTokenSvgQuery>
    | BuildCallback<EmitReturnTokenSvgQuery>
    | BuildCallback<EmitWorkerIncomingRpcEvent>
    | BuildCallback<EmitWorkerIncomingRpcBlock>
    | BuildCallback<EmitWorkerIncomingEtherscanPrice>;
