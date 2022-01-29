import invariant from 'tiny-invariant';
import { BigNumber, Contract } from 'ethers';
import gql from 'graphql-tag';

import { Address } from '../classes/Address';
import {
    cipher,
    isUndefinedOrNullOrObjectEmpty,
    loadFromLocalStorage,
    saveToLocalStorage,
} from '../lib';
import Web3State from '../state/web3';
import {
    DotnuggV1,
    DotnuggV1__factory,
    NuggftV1,
    NuggftV1__factory,
} from '../typechain';
import { executeQuery } from '../graphql/helpers';
import Web3Config from '../state/web3/Web3Config';

import ContractHelper from './abstract/ContractHelper';

export default class NuggftV1Helper extends ContractHelper {
    protected static _instance: NuggftV1;
    protected static _dotnugg: DotnuggV1;

    static get instance() {
        if (isUndefinedOrNullOrObjectEmpty(NuggftV1Helper._instance)) {
            NuggftV1Helper._instance = new Contract(
                Web3Config.activeChain__NuggftV1,
                NuggftV1__factory.abi,
                // Web3State.getLibraryOrProvider(),
            ) as NuggftV1;
        }
        return NuggftV1Helper._instance;
    }

    static get dotnugg() {
        if (isUndefinedOrNullOrObjectEmpty(NuggftV1Helper._dotnugg)) {
            NuggftV1Helper._dotnugg = new Contract(
                Web3Config.activeChain__DotnuggV1,
                DotnuggV1__factory.abi,
                // Web3State.getLibraryOrProvider(),
            ) as DotnuggV1;
        }
        return NuggftV1Helper._dotnugg;
    }

    static reset() {
        NuggftV1Helper._instance = undefined;
        NuggftV1Helper._dotnugg = undefined;
    }
    static set instance(_) {
        return;
    }

    public static async ownerOf(tokenId: string): Promise<Address> {
        const res = await this.instance.ownerOf(tokenId);
        try {
            if (res) return new Address(res);
            else throw new Error('token does not exist');
        } catch {
            return Address.ZERO;
        }
    }

    public static async optimizedDotNugg(tokenId: string) {
        invariant(tokenId, 'OP:TOKEN:URI');
        let nuggs =
            loadFromLocalStorage(`${Math.floor(+tokenId / 100)}`, false) || {};
        if (nuggs[tokenId]) {
            return nuggs[tokenId];
        } else {
            try {
                let res = await executeQuery(
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
                    // const svg = Svg.decodeSvg(res.dotnuggSvgCache);
                    nuggs =
                        loadFromLocalStorage(
                            `${Math.floor(+tokenId / 100)}`,
                            false,
                        ) || {};
                    nuggs[tokenId] = res.dotnuggRawCache;
                    saveToLocalStorage(
                        nuggs,
                        `${Math.floor(+tokenId / 100)}`,
                        false,
                    );

                    return res.dotnuggRawCache;
                }
            } catch (err) {
                console.log({ tokenId, err });
                // console.log('optimizedDotNugg:', err);
            }
        }
    }

    public static async approve(
        spender: Address,
        tokenId: string,
    ): Promise<string> {
        let response = await this.instance
            .connect(Web3State.getLibraryOrProvider())
            .approve(spender.hash, tokenId);
        return response.hash;
    }
    public static async sellerApproval(tokenId: string): Promise<boolean> {
        let response = await this.instance
            .connect(Web3State.getLibraryOrProvider())
            .getApproved(tokenId);
        return new Address(response).equals(
            new Address(Web3Config.activeChain__NuggftV1),
        );
    }
    public static async approval(tokenId: string): Promise<Address> {
        let response = await this.instance.getApproved(tokenId);
        return new Address(response);
    }

    public static async balanceOf(address: Address): Promise<BigNumber> {
        return await this.instance.balanceOf(address.hash);
    }
    public static async ethBalance(signer?: any): Promise<BigNumber> {
        return (await signer)
            ? signer.getBalance()
            : this.instance?.signer?.getBalance();
    }
}
