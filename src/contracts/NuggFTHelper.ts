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
import { NuggFT, NuggFT__factory } from '../typechain';
import { Svg } from '../classes/Svg';

import ContractHelper from './abstract/ContractHelper';

export default class NuggFTHelper extends ContractHelper {
    protected static _instance: NuggFT;
    static get instance() {
        if (isUndefinedOrNullOrObjectEmpty(NuggFTHelper._instance)) {
            NuggFTHelper._instance = new Contract(
                config.GATSBY_NUGGFT,
                NuggFT__factory.abi,
                Web3State.getLibraryOrProvider(),
            ) as NuggFT;
        }
        return NuggFTHelper._instance;
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
            return check;
        } else {
            let res: string;
            try {
                let byteArray = await NuggFTHelper.instance.rawProcessURI(
                    BigNumber.from(tokenId),
                );
                res = Svg.drawSvg(byteArray, 10);
                if (!res) throw new Error('token does not exist');
                else {
                    saveStringToLocalStorage(res, 'NL-TokenURI-' + tokenId);
                    return res;
                }
            } catch (err) {
                // console.log('optimizedDotNugg:', err);
            }
        }
    }
    public static async approve(
        spender: Address,
        tokenId: string,
    ): Promise<
        NL.Redux.Transaction.Response<NL.Redux.Transaction.ERC721ApprovalInfo>
    > {
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
                spender,
                erc721: new Address(this.instance.address),
            },
        };
    }
    public static async sellerApproval(tokenId: string): Promise<boolean> {
        let response = await this.instance.getApproved(tokenId);
        return new Address(response).equals(new Address(config.GATSBY_NUGGFT));
    }
    public static async approval(tokenId: string): Promise<Address> {
        let response = await this.instance.getApproved(tokenId);
        return new Address(response);
    }
}
