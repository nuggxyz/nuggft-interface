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

    // private static loadNugg(tokenId: string, prefix: string = '') {
    //     const nuggs = loadFromLocalStorage(`${prefix}${Math.floor(+tokenId / 100)}`, false) || {};
    //     return { nugg: nuggs[tokenId] as , nuggs: nuggs as any[] };
    // }

    // public static storeNugg(tokenId: string, dotnuggRawCache: string, prefix: string = '') {
    //     const nuggs = NuggftV1Helper.loadNugg(tokenId).nuggs;
    //     nuggs[tokenId] = dotnuggRawCache;
    //     saveToLocalStorage(nuggs, `${prefix}${Math.floor(+tokenId / 100)}`, false);
    // }

    // public static async optimizedDotNugg(tokenId: string) {
    //     invariant(tokenId, 'OP:TOKEN:URI');
    //     let { nugg } = NuggftV1Helper.loadNugg(tokenId, 'i');

    //     const isItem = tokenId.includes('item-');

    //     tokenId = extractItemId(tokenId);

    //     if (nugg) {
    //         return nugg;
    //     } else {
    //         try {
    //             let res = await executeQuery3<{
    //                 [key in 'nugg' | 'item']?: { dotnuggRawCache: Base64EncodedSvg };
    //             }>(
    //                 gql`
    //                     query OptimizedDotNugg($tokenId: ID!) {
    //                         ${isItem ? 'item' : 'nugg'}(id: $tokenId) {
    //                             dotnuggRawCache
    //                         }
    //                     }
    //                 `,
    //                 {
    //                     tokenId: tokenId.replace('item-', ''),
    //                 },
    //             );
    //             if (!res) throw new Error('token does not exist');
    //             else {
    //                 if (!isItem) {
    //                     NuggftV1Helper.storeNugg(tokenId, res.nugg.dotnuggRawCache);
    //                     return res.nugg.dotnuggRawCache;
    //                 } else {
    //                     NuggftV1Helper.storeNugg(tokenId, res.item.dotnuggRawCache, 'i');
    //                     return res.item.dotnuggRawCache;
    //                 }
    //             }
    //         } catch (err) {
    //             console.log({ tokenId, err });
    //         }
    //     }
    // }
}
