import invariant from 'tiny-invariant';
import { BigNumber, Contract } from 'ethers';

import { Address } from '../classes/Address';
import config from '../config';
import {
    isUndefinedOrNullOrObjectEmpty,
    loadStringFromLocalStorage,
    saveStringToLocalStorage,
} from '../lib';
import Web3State from '../state/web3';
import {
    IdotnuggV1Processor,
    IdotnuggV1Processor__factory,
    INuggFT,
    INuggFT__factory,
} from '../typechain';
import { Svg } from '../classes/Svg';
import {
    TokenApproveInfo,
    TransactionType,
} from '../state/transaction/interfaces';

import ContractHelper from './abstract/ContractHelper';

export default class NuggFTHelper extends ContractHelper {
    protected static _instance: INuggFT;
    protected static _dotnugg: IdotnuggV1Processor;

    static get instance() {
        if (isUndefinedOrNullOrObjectEmpty(NuggFTHelper._instance)) {
            NuggFTHelper._instance = new Contract(
                config.NUGGFT,
                INuggFT__factory.abi,
                Web3State.getLibraryOrProvider(),
            ) as INuggFT;
        }
        return NuggFTHelper._instance;
    }

    static get dotnugg() {
        if (isUndefinedOrNullOrObjectEmpty(NuggFTHelper._dotnugg)) {
            NuggFTHelper._dotnugg = new Contract(
                config.DOTNUGG_RESOLVER,
                IdotnuggV1Processor__factory.abi,
                Web3State.getLibraryOrProvider(),
            ) as IdotnuggV1Processor;
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
        let check = loadStringFromLocalStorage('NL-TokenURI-' + tokenId);
        if (check) {
            return Svg.drawSvgFromString(check, 1);
        } else {
            try {
                let byteArray = await NuggFTHelper.dotnugg.dotnuggToRaw(
                    config.NUGGFT,
                    BigNumber.from(tokenId),
                    Address.ZERO.hash,
                    40,
                    1,
                );

                if (!byteArray) throw new Error('token does not exist');
                else {
                    let byteStr = byteArray.reduce(
                        (nugg, num) => `${nugg}${num.toHexString()}`,
                        '',
                    );
                    saveStringToLocalStorage(byteStr, 'NL-TokenURI-' + tokenId);
                    return Svg.drawSvgFromString(byteStr, 1);
                }
            } catch (err) {
                // console.log({ tokenId, err });
                // console.log('optimizedDotNugg:', err);
            }
        }
    }
    public static async approve(
        spender: Address,
        tokenId: string,
    ): Promise<NL.Redux.Transaction.Response<TokenApproveInfo>> {
        let response = await this.instance
            .connect(this.instance.signer)
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
        let response = await this.instance.getApproved(tokenId);
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
