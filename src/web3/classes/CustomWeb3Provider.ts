/* eslint-disable max-classes-per-file */
import { Network, Web3Provider } from '@ethersproject/providers';

import web3 from '@src/web3';
import { Chain } from '@src/web3/core/interfaces';

export class CustomWeb3Provider extends Web3Provider {
    __chainId: Chain;

    constructor(chainId: Chain, ...args: ConstructorParameters<typeof Web3Provider>) {
        super(...args);
        this.__chainId = chainId;
    }

    getNetwork(): Promise<Network> {
        return Promise.resolve(web3.config.getNetwork(this.__chainId));
    }
}
