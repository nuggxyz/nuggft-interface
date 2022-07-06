/* eslint-disable max-classes-per-file */
import { Network, Web3Provider } from '@ethersproject/providers';

import { Chain, getNetwork } from '@src/web3/constants';

export class CustomWeb3Provider extends Web3Provider {
	__chainId: Chain;

	constructor(chainId: Chain, ...args: ConstructorParameters<typeof Web3Provider>) {
		super(...args);
		this.__chainId = chainId;
	}

	getNetwork(): Promise<Network> {
		return Promise.resolve(getNetwork(this.__chainId));
	}
}
