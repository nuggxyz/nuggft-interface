import { Log } from '@ethersproject/providers';

import {
	InterfacedEvent,
	RpcOffer,
	RpcTransfer,
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
import { SwapData } from '@src/client/v2';
import { PotentialData } from '@src/client/v3';

/*  BASE: DO NOT CHANGE  */

interface EmitEventBase {
	type: EmitEventNames;
	// callback: (arg: Remap<Omit<this, 'callback'>>) => void;
	// waitFor?: EmitEventNames;
}

// type BuildPayload<T> = Omit<T, 'callback'>;
// type BuildCallback<T extends { type: unknown; callback: unknown }> = Pick<T, 'type' | 'callback'>;

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

// interface EmitLocalRpcMint extends EmitEventBase, EmitOnChainEventBase {
//     type: EmitEventNames.Mint;
//     event: RpcMint | RpcOfferMint;
// }

interface EmitLocalRpcOffer extends EmitEventBase, EmitOnChainEventBase {
	type: EmitEventNames.Offer;
	event: RpcOffer | RpcOfferMint | RpcOfferItem;
	data: OfferData;
}

interface EmitLocalRpcTransfer extends EmitEventBase, EmitOnChainEventBase {
	type: EmitEventNames.Transfer;
	event: RpcTransfer;
}

interface EmitLocalRpcStake extends EmitEventBase, EmitOnChainEventBase {
	type: EmitEventNames.Stake;
	event: RpcStake | RpcOffer | RpcOfferMint | RpcOfferItem;
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
}

interface EmitWorkerIncomingEtherscanPrice extends EmitEventBase, EmitWorkerEventBase {
	type: EmitEventNames.IncomingEtherscanPrice;
	data: null | {
		ethusd: number;
		ethusd_timestamp: number;
	};
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
	data: any;
	name: string;
}

interface EmitRouteChange extends EmitEventBase {
	type: EmitEventNames.RouteChange;
	prevRoute: string | null;
	newRoute: string;
}

interface EmitRequestCloseMobileNavbar extends EmitEventBase {
	type: EmitEventNames.RequestCloseMobileNavbar;
}

interface EmitV2Reponse extends EmitEventBase {
	type: EmitEventNames.V2Reponse;
	curr: TokenId[];
	next: TokenId[];
	dict: TokenIdDictionary<SwapData>;
}

interface EmitV3Reponse extends EmitEventBase {
	type: EmitEventNames.V3Reponse;
	curr: TokenId[];
	dict: TokenIdDictionary<PotentialData>;
}

interface EmitV2Request extends EmitEventBase {
	type: EmitEventNames.V2Request;
	blocknum: number;
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
	RouteChange = 'main.local.RouteChange',
	RequestCloseMobileNavbar = 'main.local.RequestCloseMobileNavbar',
	V2Reponse = 'worker.response.rpc.V2Reponse',
	V3Reponse = 'worker.response.rpc.V3Reponse',
	V2Request = 'worker.request.rpc.V2Request',
	// Sell = 'local.rpc.event.Sell',
}

export type EmitEvents =
	| EmitTransactionReceipt
	| EmitTransactionResponse
	| EmitPotentialTransactionResponse
	| EmitPotentialTransactionReceipt
	| EmitLocalRpcOffer
	| EmitLocalRpcStake
	| EmitLocalRpcClaim
	| EmitLocalRpcClaimItem
	| EmitLocalRpcLoan
	| EmitLocalRpcLiquidate
	| EmitLocalRpcRebalance
	| EmitLocalRpcTransfer
	| EmitTransactionSent
	| EmitKeyboardClosed
	| EmitLocalRpcRotate
	| EmitHealthCheck
	| EmitWorkerIsRunning
	| EmitWorkerIncomingEtherscanPrice
	| EmitDevLog
	| EmitRouteChange
	| EmitRequestCloseMobileNavbar
	| EmitRequestTokenSvgQuery
	| EmitWorkerEventBase
	| EmitModalOpen
	| EmitReturnTokenSvgQuery
	| EmitWorkerIncomingRpcEvent
	| EmitWorkerIncomingRpcBlock
	| EmitV3Reponse
	| EmitV2Reponse
	| EmitV2Request;
