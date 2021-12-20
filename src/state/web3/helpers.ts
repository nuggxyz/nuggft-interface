import { AbstractConnector } from '@web3-react/abstract-connector';
import { BigNumber } from '@ethersproject/bignumber';
import { hexStripZeros } from '@ethersproject/bytes';
import { UnsupportedChainIdError } from '@web3-react/core';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';

import { Address } from '../../classes/Address';
import {
    isUndefinedOrNull,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../lib';
import store from '../store';

import Web3Config, { SupportedChainId } from './config';
import Web3Dispatches from './dispatches';

interface AddNetworkArguments {
    library: Web3Provider;
    chainId: SupportedChainId;
    info: NL.Redux.Web3.L1ChainInfo;
}

// provider.request returns Promise<any>, but wallet_switchEthereumChain must return null or throw
// see https://github.com/rekmarks/EIPs/blob/3326-create/EIPS/eip-3326.md for more info on wallet_switchEthereumChain
async function addNetwork({
    library,
    chainId,
    info,
}: AddNetworkArguments): Promise<null | void> {
    if (!library?.provider?.request) {
        return;
    }
    const formattedChainId = hexStripZeros(
        BigNumber.from(chainId).toHexString(),
    );
    try {
        await library?.provider.request({
            method: 'wallet_addEthereumChain',
            params: [
                {
                    chainId: formattedChainId,
                    chainName: info.label,
                    rpcUrls: info.rpcUrls,
                    nativeCurrency: info.nativeCurrency,
                    blockExplorerUrls: [info.explorer],
                },
            ],
        });
    } catch (error) {
        console.error('error adding eth network: ', chainId, info, error);
    }
}

interface SwitchNetworkArguments {
    library: Web3Provider;
    chainId?: SupportedChainId;
}

// provider.request returns Promise<any>, but wallet_switchEthereumChain must return null or throw
// see https://github.com/rekmarks/EIPs/blob/3326-create/EIPS/eip-3326.md for more info on wallet_switchEthereumChain
async function switchToNetwork({
    library,
    chainId,
}: SwitchNetworkArguments): Promise<null | void> {
    if (!library?.provider?.request) {
        return;
    }
    if (!chainId && library?.getNetwork) {
        ({ chainId } = await library.getNetwork());
    }
    const formattedChainId = hexStripZeros(
        BigNumber.from(chainId).toHexString(),
    );
    try {
        await library?.provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: formattedChainId }],
        });
    } catch (error) {
        // 4902 is the error code for attempting to switch to an unrecognized chainId
        if (error.code === 4902 && chainId !== undefined) {
            const info = Web3Config.CHAIN_INFO[chainId];

            // metamask (only known implementer) automatically switches after a network is added
            // the second call is done here because that behavior is not a part of the spec and cannot be relied upon in the future
            // metamask's behavior when switching to the current network is just to return null (a no-op)
            await addNetwork({ library, chainId, info });
            await switchToNetwork({ library, chainId });
        } else {
            throw error;
        }
    }
}

let _library: Web3Provider;

let _networkLibrary: Web3Provider;

const getLibrary = (provider?: any): Web3Provider => {
    let library: Web3Provider;
    if (isUndefinedOrNullOrObjectEmpty(provider)) {
        if (isUndefinedOrNullOrObjectEmpty(_networkLibrary)) {
            let networkProvider = Web3Config.connectors.network.provider;
            _networkLibrary = new Web3Provider(
                networkProvider as any,
                !isUndefinedOrNull(networkProvider.chainId)
                    ? +networkProvider.chainId
                    : 'any',
            );
        }
        library = _networkLibrary;
    } else {
        if (isUndefinedOrNullOrObjectEmpty(_library)) {
            _library = new Web3Provider(
                provider as any,
                !isUndefinedOrNull(provider.chainId)
                    ? +provider.chainId
                    : 'any',
            );
        }
        library = _networkLibrary;
    }
    library.pollingInterval = 1000;
    return library;
};

const getLibraryOrProvider = ():
    | Web3Provider
    | ethers.providers.JsonRpcSigner => {
    return isUndefinedOrNullOrStringEmpty(store.getState().web3.web3address)
        ? getLibrary()
        : new ethers.providers.Web3Provider(window.ethereum).getSigner();
};

// account is not optional
const getSigner = (account: Address): JsonRpcSigner => {
    return getLibrary().getSigner(account.hash).connectUnchecked();
};

// account is optional
const getProviderOrSigner = (
    library: Web3Provider,
    account?: Address,
): Web3Provider | JsonRpcSigner => {
    return account ? getSigner(account) : library;
};

let deactivate: () => void;

let activate: (
    connector: AbstractConnector,
    onError?: (error: Error) => void,
    throwErrors?: boolean,
) => Promise<void>;

const safeActivate = (connector?: AbstractConnector) => {
    Web3Dispatches.setWeb3Status('PENDING');
    Web3Dispatches.setWeb3Error(false);

    if (!isUndefinedOrNullOrObjectEmpty(connector)) {
        Web3Helpers.activate(connector, undefined, true)
            .then(() => Web3Dispatches.setWeb3Status('SELECTED'))
            .catch((error) => {
                console.log({ error });
                // a little janky...can't use setError because the connector isn't set
                if (error instanceof UnsupportedChainIdError) {
                    Web3Helpers.activate(connector);
                    Web3Dispatches.setWeb3Status('SELECTED');
                } else {
                    Web3Dispatches.setWeb3Error(true);
                    Web3Dispatches.setWeb3Status('NOT_SELECTED');
                }
            });
    } else {
        Web3Dispatches.setWeb3Status('NOT_SELECTED');
    }
};

const Web3Helpers = {
    switchToNetwork,
    addNetwork,
    getLibrary,
    getLibraryOrProvider,
    getSigner,
    getProviderOrSigner,
    deactivate,
    activate,
    safeActivate,
};

export default Web3Helpers;
