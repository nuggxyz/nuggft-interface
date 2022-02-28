import { InfuraWebSocketProvider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { ApolloClient, InMemoryCache } from '@apollo/client';

import { buildApolloSplitLink } from '@src/graphql/client';

import { MetaMask } from './clients/metamask';
import { Network } from './clients/network';
import { WalletConnect } from './clients/walletconnect';
import { WalletLink } from './clients/walletlink';
import { getPriorityConnector, initializeConnector } from './core/core';

export enum SupportedChainId {
    MAINNET = 1,
    ROPSTEN = 3,
    RINKEBY = 4,
    GOERLI = 5,
}

export function supportedChainIds() {
    // @ts-ignore
    return Object.values<number>(SupportedChainId);
}

export const DEFAULT_CHAIN = 5;

export const NETWORK_HEALTH_CHECK_MS = 15 * 1000;
export const DEFAULT_MS_BEFORE_WARNING = 90 * 1000;

export const INFURA_KEY = 'a1625b39cf0047febd415f9b37d8c931';

export const isValidChainId = (input: number) => {
    return supportedChainIds().indexOf(input) !== -1;
};

export const CONTRACTS = {
    [SupportedChainId.MAINNET]: {
        NuggftV1: ethers.constants.AddressZero,
        DotnuggV1: ethers.constants.AddressZero,
    },
    [SupportedChainId.ROPSTEN]: {
        NuggftV1: '0x420690c1b1519a32fa36768dc2cefe128160a9b7',
        DotnuggV1: '0x420690542c8DeDDe5aF93684897CE3CA7422FE57',
    },
    [SupportedChainId.RINKEBY]: {
        NuggftV1: '0x8239075908f08b64ab7818ff79652d25ae5301c6',
        DotnuggV1: '0x8239075908f08b64ab7818ff79652d25ae5301c6',
    },
    [SupportedChainId.GOERLI]: {
        NuggftV1: '0x7ccd9a783e43845f3ae37e83b4a696b0cfab114c',
        DotnuggV1: '0x9a3b1be8ec7eaf472b22c9c833164297e2940f27',
    },
};

export const GRAPH_ENPOINTS = {
    [SupportedChainId.MAINNET]: `https://api.thegraph.com/subgraphs/name/nuggxyz/nuggftv1-mainnet`,
    [SupportedChainId.RINKEBY]: `https://api.thegraph.com/subgraphs/name/nuggxyz/nuggftv1-rinkeby`,
    [SupportedChainId.ROPSTEN]: `https://api.thegraph.com/subgraphs/name/nuggxyz/nuggftv1-ropsten`,
    [SupportedChainId.GOERLI]: `https://api.thegraph.com/subgraphs/name/nuggxyz/nuggftv1-goerli`,
};

export const GRAPH_WSS_ENDPOINTS = {
    [SupportedChainId.MAINNET]: `wss://api.thegraph.com/subgraphs/name/nuggxyz/nuggftv1-mainnet`,
    [SupportedChainId.RINKEBY]: `wss://api.thegraph.com/subgraphs/name/nuggxyz/nuggftv1-rinkeby`,
    [SupportedChainId.ROPSTEN]: `wss://api.thegraph.com/subgraphs/name/nuggxyz/nuggftv1-ropsten`,
    [SupportedChainId.GOERLI]: `wss://api.thegraph.com/subgraphs/name/nuggxyz/nuggftv1-goerli`,
};

export const NETWORK_URLS = {
    [SupportedChainId.MAINNET]: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
    [SupportedChainId.RINKEBY]: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
    [SupportedChainId.ROPSTEN]: `https://ropsten.infura.io/v3/${INFURA_KEY}`,
    [SupportedChainId.GOERLI]: `https://goerli.infura.io/v3/${INFURA_KEY}`,
};

export const WSS_URLS = {
    [SupportedChainId.MAINNET]: `wss://mainnet.infura.io/v3/${INFURA_KEY}`,
    [SupportedChainId.RINKEBY]: `wss://rinkeby.infura.io/v3/${INFURA_KEY}`,
    [SupportedChainId.ROPSTEN]: `wss://ropsten.infura.io/v3/${INFURA_KEY}`,
    [SupportedChainId.GOERLI]: `wss://goerli.infura.io/v3/${INFURA_KEY}`,
};

export const connectors = {
    metamask: initializeConnector<MetaMask>((actions) => new MetaMask(actions, true)),
    walletconnect: initializeConnector<WalletConnect>(
        (actions) =>
            new WalletConnect(actions, {
                rpc: NETWORK_URLS,
            }),
        Object.keys(NETWORK_URLS).map((chainId) => Number(chainId)),
    ),
    walletlink: initializeConnector<WalletLink>(
        (actions) =>
            new WalletLink(actions, {
                url: NETWORK_URLS[1][0],
                appName: 'NuggftV1',
            }),
    ),
    network: initializeConnector<Network>(
        (actions) => new Network(actions, NETWORK_URLS, true, 5),
        Object.keys(NETWORK_URLS).map((chainId) => Number(chainId)),
    ),
};

export const priority = getPriorityConnector(...Object.values(connectors).map((x) => x));

export const SUPPORTED_WALLETS: { [key: string]: NL.Redux.Web32.WalletInfo } = {
    METAMASK: {
        connector: connectors.metamask,
        name: 'MetaMask',
        iconURL: 'metamask',
        description: 'Easy-to-use browser extension.',
        href: null,
        color: '#E8831D',
    },
    WALLET_CONNECT: {
        connector: connectors.walletconnect,
        name: 'WalletConnect',
        iconURL: 'walletConnect',
        description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
        href: null,
        color: '#4196FC',
        mobile: true,
    },
    WALLET_LINK: {
        connector: connectors.walletlink,
        name: 'Coinbase',
        iconURL: 'coinbase',
        description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
        href: null,
        color: '#1652f0',
        mobile: true,
    },
};

export const CHAIN_INFO: {
    [key in SupportedChainId]: L1ChainInfo;
} = {
    [SupportedChainId.MAINNET]: {
        docs: 'https://docs.uniswap.org/',
        explorer: 'https://etherscan.io/',
        infoLink: 'https://info.uniswap.org/#/',
        name: 'Ethereum',
        logoUrl: 'assets/images/ethereum-logo.png',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        label: 'mainnet',
    },
    [SupportedChainId.RINKEBY]: {
        docs: 'https://docs.uniswap.org/',
        explorer: 'https://rinkeby.etherscan.io/',
        infoLink: 'https://info.uniswap.org/#/',
        name: 'Rinkeby',
        nativeCurrency: {
            name: 'Rinkeby ETH',
            symbol: 'rinkETH',
            decimals: 18,
        },
        label: 'rinkeby',
    },
    [SupportedChainId.ROPSTEN]: {
        docs: 'https://docs.uniswap.org/',
        explorer: 'https://ropsten.etherscan.io/',
        infoLink: 'https://info.uniswap.org/#/',
        name: 'Ropsten',
        nativeCurrency: {
            name: 'Ropsten ETH',
            symbol: 'ropETH',
            decimals: 18,
        },
        label: 'ropsten',
    },
    [SupportedChainId.GOERLI]: {
        docs: 'https://docs.uniswap.org/',
        explorer: 'https://goerli.etherscan.io/',
        infoLink: 'https://info.uniswap.org/#/',
        name: 'Görli',
        nativeCurrency: {
            name: 'Görli ETH',
            symbol: 'görETH',
            decimals: 18,
        },
        label: 'goerli',
    },
};

export const createInfuraWebSocket = (chainId: SupportedChainId) => {
    return new InfuraWebSocketProvider(CHAIN_INFO[chainId].label, INFURA_KEY);
};

export const createApolloClient = (chainId: SupportedChainId) => {
    const ok = new ApolloClient<any>({
        link: buildApolloSplitLink(GRAPH_ENPOINTS[chainId], GRAPH_WSS_ENDPOINTS[chainId]),
        // connectToDevTools: true,

        cache: new InMemoryCache(),
    });
    // window.__APOLLO_CLIENT__ = ok;
    return ok;
};

export const ENS_REGISTRAR_ADDRESSES: NL.Redux.Web32.AddressMap = {
    [SupportedChainId.MAINNET]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    [SupportedChainId.ROPSTEN]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    [SupportedChainId.GOERLI]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    [SupportedChainId.RINKEBY]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
};
