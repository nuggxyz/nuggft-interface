import { Contract } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';

import { Address } from '@src/classes/Address';
import { NuggftV1, NuggftV1__factory } from '@src/typechain';
import web3 from '@src/web3';
import { Chain } from '@src/web3/core/interfaces';

import ContractHelper from './abstract/ContractHelper';

export default class NuggftV1Helper extends ContractHelper {
    public contract: NuggftV1;

    constructor(chainId: Chain, provider: Web3Provider | undefined) {
        super();
        this.contract = new Contract(
            web3.config.CONTRACTS[chainId].NuggftV1,
            NuggftV1__factory.abi,
            provider,
        ) as NuggftV1;
        if (provider) this.contract.connect(provider);
    }

    public async ownerOf(tokenId: string): Promise<Address> {
        const res = await this.contract.ownerOf(tokenId);
        try {
            if (res) return new Address(res);
            throw new Error('token does not exist');
        } catch {
            return Address.ZERO;
        }
    }
}
