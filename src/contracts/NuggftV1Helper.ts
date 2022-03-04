import invariant from 'tiny-invariant';
import { Contract } from 'ethers';
import gql from 'graphql-tag';
import { Web3Provider } from '@ethersproject/providers';

import { Address } from '@src/classes/Address';
import { loadFromLocalStorage, saveToLocalStorage } from '@src/lib';
import { NuggftV1, NuggftV1__factory } from '@src/typechain';
import { executeQuery } from '@src/graphql/helpers';
import web3 from '@src/web3';
import { Chain } from '@src/web3/core/interfaces';

import ContractHelper from './abstract/ContractHelper';

export default class NuggftV1Helper extends ContractHelper {
    public contract: NuggftV1;

    constructor(chainId: Chain, provider: Web3Provider) {
        super();
        this.contract = new Contract(
            web3.config.CONTRACTS[chainId].NuggftV1,
            NuggftV1__factory.abi,
            provider,
        ) as NuggftV1;
        this.contract.connect(provider);
    }

    public async ownerOf(tokenId: string): Promise<Address> {
        const res = await this.contract.ownerOf(tokenId);
        try {
            if (res) return new Address(res);
            else throw new Error('token does not exist');
        } catch {
            return Address.ZERO;
        }
    }

    public static storeNugg(tokenId: string, dotnuggRawCache: string) {
        const nuggs = loadFromLocalStorage(`${Math.floor(+tokenId / 100)}`, false) || {};
        nuggs[tokenId] = dotnuggRawCache;
        saveToLocalStorage(nuggs, `${Math.floor(+tokenId / 100)}`, false);
    }

    public static async optimizedDotNugg(chainId: number, tokenId: string) {
        invariant(tokenId, 'OP:TOKEN:URI');
        let nuggs = loadFromLocalStorage(`${Math.floor(+tokenId / 100)}`, false) || {};
        if (nuggs[tokenId]) {
            return nuggs[tokenId];
        } else {
            try {
                let res = await executeQuery(
                    chainId,
                    gql`
                        {
                            nugg(id: "${tokenId}") {
                                dotnuggRawCache
                            }
                        }
                    `,
                    'nugg',
                );
                if (!res) throw new Error('token does not exist');
                else {
                    NuggftV1Helper.storeNugg(tokenId, res.dotnuggRawCache);
                    return res.dotnuggRawCache;
                }
            } catch (err) {
                console.log({ tokenId, err });
                // console.log('optimizedDotNugg:', err);
            }
        }
    }
}
