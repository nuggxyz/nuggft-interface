import { Contract, ethers } from 'ethers';
import { namehash } from '@ethersproject/hash';

import config from '../config';
import { isUndefinedOrNullOrObjectEmpty } from '../lib';
import { EnsRegistrar__factory, EnsResolver } from '../typechain';
import { Address } from '../classes/Address';
import Web3State from '../state/web3';
import { EnsResolver__factory } from '../typechain/factories/EnsResolver__factory';
import { EnsRegistrar } from '../typechain/EnsRegistrar';
import Web3Config from '../state/web3/Web3Config';

export default class ENSHelper {
    private static _instance_resolver: EnsResolver;
    private static _instance_registrar: EnsRegistrar;
    // private static _signer: ethers.Signer;
    static get signer() {
        return Web3State.getSignerOrProvider() as ethers.providers.Web3Provider;
    }
    static set signer(_) {
        return;
    }
    static get registrar() {
        // if (isUndefinedOrNullOrObjectEmpty(ENSHelper._instance_registrar)) {
        ENSHelper._instance_registrar = new Contract(
            Web3Config.activeChain__EnsRegistrar,
            EnsRegistrar__factory.abi,
            ENSHelper.signer,
        ) as EnsRegistrar;
        // }
        return ENSHelper._instance_registrar;
    }
    /**
     * Fetches and decodes the result of an ENS contenthash lookup on mainnet to a URI
     * @param ensName to resolve
     * @param provider provider to use to fetch the data
     */
    private static async resolveContentHash(ensName: string): Promise<string> {
        const resolver = await this.resolver(ensName, ENSHelper.signer);
        return await resolver.contenthash(namehash(ensName));
    }
    /**
     * Fetches and decodes the result of an ENS contenthash lookup on mainnet to a URI
     * @param ensName to resolve
     * @param provider provider to use to fetch the data
     */
    private static async resolveAddress(ensName: string): Promise<string> {
        try {
            const resolver = await this.resolver(ensName, ENSHelper.signer);
            const res = await resolver.addr(namehash(ensName));
            if (res && Address.isAddress(res)) return res;
            return undefined;
        } catch (err) {
            console.log(ensName, err);
            return undefined;
        }
    }
    /**
     * Fetches and decodes the result of an ENS contenthash lookup on mainnet to a URI
     * @param ensName to resolve
     * @param provider provider to use to fetch the data
     */
    private static async resolveName(address: Address): Promise<string> {
        try {
            if (
                !isUndefinedOrNullOrObjectEmpty(address) &&
                !address.equals(Address.ZERO)
            ) {
                const resolver = await this.reverseResolver(
                    address,
                    ENSHelper.signer,
                );
                const res2 = await resolver.name(address.reverse_namehash);
                return res2;
            }
        } catch (err) {
            console.log(err);
            return undefined;
        }
    }
    /**
     * Fetches and decodes the result of an ENS contenthash lookup on mainnet to a URI
     * @param ensName to resolve
     * @param provider provider to use to fetch the data
     */
    public static async resolve(address: Address): Promise<string> {
        try {
            const name = await this.resolveName(address);
            if (name) {
                const toValidate = await this.resolveAddress(name);
                if (toValidate && address.equals(new Address(toValidate)))
                    return name;
            }
            return undefined;
        } catch (err) {
            console.log(err);
            return undefined;
        }
    }
    private static async resolver(
        ensName: string,
        signer: ethers.providers.Web3Provider,
    ): Promise<EnsResolver> {
        ENSHelper._instance_resolver = new Contract(
            await ENSHelper.registrar.resolver(namehash(ensName)),
            EnsResolver__factory.abi,
            signer,
        ) as EnsResolver;
        return ENSHelper._instance_resolver;
    }
    private static async reverseResolver(
        address: Address,
        signer: ethers.providers.Web3Provider,
    ): Promise<EnsResolver> {
        ENSHelper._instance_resolver = new Contract(
            await ENSHelper.registrar.resolver(address.reverse_namehash),
            EnsResolver__factory.abi,
            signer,
        ) as EnsResolver;
        return ENSHelper._instance_resolver;
    }
}

// Reverse Registrar - claim and set name here: 0x6F628b68b30Dc3c17f345c9dbBb1E483c2b7aE5c
// Default Reverse Resolver - set name here: 0x084b1c3C81545d370f3634392De611CaaBFf8148
// other default resolver : 0x42D63ae25990889E35F215bC95884039Ba354115
