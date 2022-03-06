import invariant from 'tiny-invariant';
import { Contract } from 'ethers';
import gql from 'graphql-tag';
import { Web3Provider } from '@ethersproject/providers';

import { Address } from '@src/classes/Address';
import { loadFromLocalStorage, saveToLocalStorage } from '@src/lib';
import { NuggftV1, NuggftV1__factory } from '@src/typechain';
import { executeQuery3 } from '@src/graphql/helpers';
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

    private static loadNugg(tokenId: string, prefix?: string) {
        const nuggs = loadFromLocalStorage(`${prefix}${Math.floor(+tokenId / 100)}`, false) || {};
        return { nugg: nuggs[tokenId], nuggs: nuggs };
    }

    public static storeNugg(tokenId: string, dotnuggRawCache: string, prefix?: string) {
        const nuggs = NuggftV1Helper.loadNugg(tokenId).nuggs;
        nuggs[tokenId] = dotnuggRawCache;
        saveToLocalStorage(nuggs, `${prefix}${Math.floor(+tokenId / 100)}`, false);
    }

    public static async optimizedDotNugg(tokenId: string) {
        invariant(tokenId, 'OP:TOKEN:URI');
        let nugg = NuggftV1Helper.loadNugg(tokenId).nugg;
        if (nugg) {
            return nugg;
        } else {
            try {
                let res = await executeQuery3<{ nugg: { dotnuggRawCache: Base64EncodedSvg } }>(
                    gql`
                        query OptimizedDotNugg($tokenId: ID!) {
                            nugg(id: $tokenId) {
                                dotnuggRawCache
                            }
                        }
                    `,
                    {
                        tokenId,
                    },
                );
                if (!res) throw new Error('token does not exist');
                else {
                    NuggftV1Helper.storeNugg(tokenId, res.nugg.dotnuggRawCache);
                    return res.nugg.dotnuggRawCache;
                }
            } catch (err) {
                console.log({ tokenId, err });
            }
        }
    }

    public static async optimizedDotNuggItem(tokenId: string) {
        invariant(tokenId, 'OP:TOKEN:URI');
        let nugg = NuggftV1Helper.loadNugg(tokenId, 'i').nugg;
        if (nugg) {
            return nugg;
        } else {
            try {
                let res = await executeQuery3<{ item: { dotnuggRawCache: Base64EncodedSvg } }>(
                    gql`
                        query OptimizedDotNugg($tokenId: ID!) {
                            item(id: $tokenId) {
                                dotnuggRawCache
                            }
                        }
                    `,
                    {
                        tokenId,
                    },
                );
                if (!res) throw new Error('token does not exist');
                else {
                    NuggftV1Helper.storeNugg(tokenId, res.item.dotnuggRawCache, 'i');
                    return res.item.dotnuggRawCache;
                }
            } catch (err) {
                console.log({ tokenId, err });
            }
        }
    }
}
