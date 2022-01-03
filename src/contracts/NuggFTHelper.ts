import invariant from 'tiny-invariant';
import { BigNumber, Contract } from 'ethers';
import gql from 'graphql-tag';

import { Address } from '../classes/Address';
import config from '../config';
import {
    cipher,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
    loadFromLocalStorage,
    loadStringFromLocalStorage,
    saveStringToLocalStorage,
    saveToLocalStorage,
} from '../lib';
import Web3State from '../state/web3';
import { Svg } from '../classes/Svg';
import {
    TokenApproveInfo,
    TransactionType,
} from '../state/transaction/interfaces';
import {
    DotnuggV1Processor,
    DotnuggV1Processor__factory,
    NuggFT,
    NuggFT__factory,
} from '../typechain';
import { executeQuery } from '../graphql/helpers';
import AppState from '../state/app';

import ContractHelper from './abstract/ContractHelper';

export default class NuggFTHelper extends ContractHelper {
    protected static _instance: NuggFT;
    protected static _dotnugg: DotnuggV1Processor;

    static get instance() {
        if (isUndefinedOrNullOrObjectEmpty(NuggFTHelper._instance)) {
            NuggFTHelper._instance = new Contract(
                config.NUGGFT,
                NuggFT__factory.abi,
                // Web3State.getLibraryOrProvider(),
            ) as NuggFT;
        }
        return NuggFTHelper._instance;
    }

    static get dotnugg() {
        if (isUndefinedOrNullOrObjectEmpty(NuggFTHelper._dotnugg)) {
            NuggFTHelper._dotnugg = new Contract(
                config.DOTNUGG_RESOLVER,
                DotnuggV1Processor__factory.abi,
                // Web3State.getLibraryOrProvider(),
            ) as DotnuggV1Processor;
        }
        return NuggFTHelper._dotnugg;
    }

    static reset() {
        NuggFTHelper._instance = undefined;
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
    ): Promise<NL.Redux.Transaction.Response<TokenApproveInfo>> {
        let response = await this.instance
            .connect(Web3State.getLibraryOrProvider())
            .approve(spender.hash, tokenId);
        return {
            response,
            hash: response.hash,
            addedTime: new Date().getTime(),
            from: response.from,
            info: {
                tokenId,
                type: TransactionType.TOKEN_APPROVE,
                // spender,
                // erc721: new Address(this.instance.address),
            },
        };
    }
    public static async sellerApproval(tokenId: string): Promise<boolean> {
        let response = await this.instance
            .connect(Web3State.getLibraryOrProvider())
            .getApproved(tokenId);
        return new Address(response).equals(new Address(config.NUGGFT));
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
