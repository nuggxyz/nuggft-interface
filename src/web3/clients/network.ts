import { Eip1193Bridge } from '@ethersproject/experimental';
import type { ConnectionInfo } from '@ethersproject/web';
import { FallbackProvider, FallbackProviderConfig } from '@ethersproject/providers';
import { VoidSigner } from '@ethersproject/abstract-signer';

import { Connector, Actions } from '@src/web3/core/types';
import { PeerInfo__Rpc, Connector as ConnectorEnum } from '@src/web3/core/interfaces';
// eslint-disable-next-line import/no-cycle
import { DEFAULT_CHAIN, ADDRESS_ZERO } from '@src/web3/constants';
import { CustomJsonRpcProvider } from '@src/web3/classes/CustomJsonRpcProvider';

export type url = string | ConnectionInfo;

export class Network extends Connector {
	/** {@inheritdoc Connector.provider} */
	public provider: Eip1193Bridge | undefined = undefined;

	private urlMap: Record<number, url[]>;

	private defaultChainId: number;

	private providerCache: Record<number, Promise<Eip1193Bridge> | undefined> = {};

	/**
	 * @param urlMap - A mapping from chainIds to RPC urls.
	 * @param connectEagerly - A flag indicating whether connection should be initiated when the class is constructed.
	 * @param defaultChainId - The chainId to connect to if connectEagerly is true.
	 */
	constructor(
		peer: PeerInfo__Rpc,
		actions: Actions,
		urlMap: { [chainId: number]: url | url[] },
		connectEagerly = false,
		defaultChainId = DEFAULT_CHAIN,
	) {
		super(ConnectorEnum.Rpc, actions, [peer]);

		this.urlMap = Object.keys(urlMap).reduce<{ [chainId: number]: url[] }>(
			(accumulator, chainId) => {
				const urls = urlMap[Number(chainId)];
				accumulator[Number(chainId)] = Array.isArray(urls) ? urls : [urls];
				return accumulator;
			},
			{},
		);

		this.defaultChainId = defaultChainId;

		if (connectEagerly) void this.activate();
	}

	private async isomorphicInitialize(chainId: number): Promise<Eip1193Bridge> {
		if (this.providerCache[chainId])
			return this.providerCache[chainId] as Promise<Eip1193Bridge>;

		// eslint-disable-next-line no-return-assign
		return (this.providerCache[chainId] = Promise.all([]).then(() => {
			const urls = this.urlMap[chainId];

			const providers = urls.map((_url) => new CustomJsonRpcProvider(chainId, _url, chainId));

			return new Eip1193Bridge(
				new VoidSigner(ADDRESS_ZERO),
				providers.length === 1
					? providers[0]
					: new FallbackProvider(
							providers.map((x, i) => {
								return {
									provider: x,
									stallTimeout: 500,
									priority: i,
								} as FallbackProviderConfig;
							}),
					  ),
			);
		}));
	}

	/**
	 * Initiates a connection.
	 *
	 * @param desiredChainId - The desired chain to connect to.
	 */
	public async activate(desiredChainId = this.defaultChainId): Promise<void> {
		this.actions.startActivation();

		this.provider = await this.isomorphicInitialize(desiredChainId);

		return this.provider
			.request({ method: 'eth_chainId' })
			.then((chainId: number) => {
				this.actions.update({
					chainId: Number(chainId),
					accounts: [],
					peer: this.peers.rpc,
				});
			})
			.catch((error: Error) => {
				this.actions.reportError(error);
			});
	}
}
