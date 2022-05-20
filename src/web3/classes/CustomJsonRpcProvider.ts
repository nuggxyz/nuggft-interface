/* eslint-disable max-classes-per-file */
import { JsonRpcProvider, Network } from '@ethersproject/providers';

import { Chain, getNetwork } from '@src/web3/constants';

export class CustomJsonRpcProvider extends JsonRpcProvider {
    __chainId: Chain;

    constructor(chainId: Chain, ...args: ConstructorParameters<typeof JsonRpcProvider>) {
        super(...args);
        this.__chainId = chainId;
    }

    getNetwork(): Promise<Network> {
        return Promise.resolve(getNetwork(this.__chainId));
    }
}
