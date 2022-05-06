/* eslint-disable max-classes-per-file */
import { JsonRpcProvider, Network } from '@ethersproject/providers';

import web3 from '@src/web3';
import { Chain } from '@src/web3/core/interfaces';

export class CustomJsonRpcProvider extends JsonRpcProvider {
    __chainId: Chain;

    constructor(chainId: Chain, ...args: ConstructorParameters<typeof JsonRpcProvider>) {
        super(...args);
        this.__chainId = chainId;
    }

    getNetwork(): Promise<Network> {
        return Promise.resolve(web3.config.getNetwork(this.__chainId));
    }
}
