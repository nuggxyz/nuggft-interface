import type { EventEmitter } from 'node:events';

import type { State, StoreApi } from 'zustand/vanilla';
import type WalletConnectProvider from '@walletconnect/ethereum-provider';
import { ExternalProvider, JsonRpcFetchFunc } from '@ethersproject/providers';

import { Chain } from '@src/web3/constants';

import { Connector as ConnectorEnum, PeerInfo, Peer } from './interfaces';

export interface Web3ReactState extends State {
	chainId: Chain | undefined;
	peer: PeerInfo | undefined;
	accounts: AddressString[] | undefined;
	activating: boolean;
	error: Error | undefined;
}

export type Web3ReactStore = StoreApi<Web3ReactState>;

export type Web3ReactStateUpdate = {
	chainId?: Chain;
	accounts?: AddressString[];
	peer?: PeerInfo | undefined;
};

export interface Actions {
	startActivation: () => () => void;
	update: (stateUpdate: Web3ReactStateUpdate) => void;
	reportError: (error: Error | undefined) => void;
}

// per EIP-1193
export interface RequestArguments {
	readonly method: string;
	readonly params?: readonly unknown[] | object;
}

// per EIP-1193
export interface Provider extends EventEmitter {
	request(args: RequestArguments): Promise<unknown>;
}

// per EIP-1193
export interface ProviderConnectInfo {
	readonly chainId: string;
}

// per EIP-1193
export interface ProviderRpcError extends Error {
	message: string;
	code: number;
	data?: unknown;
}

// per EIP-3085
export interface AddEthereumChainParameter {
	chainId: number;
	chainName: string;
	nativeCurrency: {
		name: string;
		symbol: string; // 2-6 characters long
		decimals: 18;
	};
	rpcUrls: string[];
	blockExplorerUrls?: string[];
	iconUrls?: string[]; // Currently ignored.
}

export interface BaseCoreProvider {
	type: ConnectorEnum;
	provider?: ExternalProvider | JsonRpcFetchFunc | Provider;
}

export interface WalletConnectCoreProvider extends BaseCoreProvider {
	type: ConnectorEnum.WalletConnect;
	provider: WalletConnectProvider & EventEmitter;
}

export interface RpcCoreProvider extends BaseCoreProvider {
	type: ConnectorEnum.Rpc;
	provider: Provider;
}
export interface InjectedCoreProvider extends BaseCoreProvider {
	type: ConnectorEnum.Injected;
	provider: Provider;
}
export interface CoinbaseWalletSDKCoreProvider extends BaseCoreProvider {
	type: ConnectorEnum.CoinbaseWalletSDK;
	provider: Provider;
}

export type CoreProvider =
	| WalletConnectCoreProvider
	| RpcCoreProvider
	| InjectedCoreProvider
	| CoinbaseWalletSDKCoreProvider;

export abstract class Connector {
	/**
	 * An
	 * EIP-1193 ({@link https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md}) and
	 * EIP-1102 ({@link https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1102.md}) compliant provider.
	 * May also comply with EIP-3085 ({@link https://github.com/ethereum/EIPs/blob/master/EIPS/eip-3085.md}).
	 * This property must be defined while the connector is active.
	 */
	public provider: CoreProvider['provider'] | undefined;

	protected readonly actions: Actions;

	public readonly connectorType: ConnectorEnum;

	public peers: { [key in Peer]?: PeerInfo };

	/**
	 * @param actions - Methods bound to a zustand store that tracks the state of the connector.
	 * Actions are used by the connector to report changes in connection status.
	 */
	constructor(type: ConnectorEnum, actions: Actions, peers: PeerInfo[]) {
		this.actions = actions;
		this.peers = peers.reduce((prev, curr) => {
			return { ...prev, [curr.peer]: curr };
		}, {});
		this.connectorType = type;
	}

	/**
	 * Attempt to initiate a connection, failing silently
	 */
	public connectEagerly?(...args: unknown[]): Promise<void> | void;

	public refreshPeer?(): void;

	/**
	 * Initiate a connection.
	 */
	public abstract activate(...args: unknown[]): Promise<void> | void;

	/**
	 * Initiate a disconnect.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public deactivate(...args: unknown[]): Promise<void> | void {
		this.actions.reportError(undefined);
	}
}
