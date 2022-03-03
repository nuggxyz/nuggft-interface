import { InfuraWebSocketProvider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { ApolloClient, InMemoryCache } from '@apollo/client';

import { buildApolloSplitLink } from '@src/graphql/client';

import {
    Connector,
    ConnectorInfo,
    ConnectorNormalInfo,
    ConnectorSpecificInfo,
    ConnectorType,
    SupportedConnectors,
} from './core/types';
import { getPriorityConnector, initializeConnector, ResWithStore } from './core/core';
import { WalletLink } from './clients/walletlink';
import { Network } from './clients/network';
import { MetaMask } from './clients/metamask';
import { WalletConnectSpecific } from './clients/walletconnect-specific';
import { WalletConnect } from './clients/walletconnect';

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

export const connector_info_rainbow: ConnectorSpecificInfo = {
    type: ConnectorType.SPECIFIC,
    name: 'Rainbow',
    label: 'rainbow',
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
    href: 'https://rnbwapp.com/',
    color: 'rgb(0,62,140)',
    mobile: true,
    peerurl: 'https://rainbow.me',
};

export const connector_info_metamask: ConnectorInfo = {
    type: window.ethereum ? ConnectorType.NORMAL : ConnectorType.SPECIFIC,
    name: 'MetaMask',
    label: 'metamask',
    description: 'Easy-to-use browser extension.',
    href: 'https://metamask.app.link/',
    color: '#E8831D',
    peerurl: 'https://metamask.io',
};

export const connector_info_ledgerlive: ConnectorSpecificInfo = {
    type: ConnectorType.SPECIFIC,
    name: 'Ledger',
    label: 'ledgerlive',
    description: '',
    href: 'ledgerlive://',
    color: '#000',
    mobile: true,
    peerurl: 'https://www.ledger.com/',
};

export const connector_info_trust: ConnectorSpecificInfo = {
    type: ConnectorType.SPECIFIC,
    name: 'Trust Wallet',
    label: 'trust',
    description: 'nope',
    href: 'https://link.trustwallet.com/',
    color: '#3375BB',
    mobile: true,
    peerurl: 'https://trustwallet.com/',
};
export const connector_info_cryptodotcom: ConnectorSpecificInfo = {
    type: ConnectorType.SPECIFIC,
    name: 'Crypto.com',
    label: 'cryptodotcom',
    description: 'nope',
    href: 'https://wallet.crypto.com/',
    color: '#002D74',
    mobile: true,
    peerurl: 'https://crypto.com/',
};

export const connector_info_coinbase: ConnectorNormalInfo = {
    type: ConnectorType.NORMAL,
    name: 'Coinbase Wallet',
    label: 'coinbase',
    description: 'nope',
    href: null,
    color: '#1652f0',
    mobile: true,
};
export const connector_info_walletconnect: ConnectorNormalInfo = {
    type: ConnectorType.NORMAL,
    name: 'WalletConnect',
    label: 'walletconnect',
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
    href: null,
    color: '#4196FC',
    mobile: true,
};
export const connector_info_infura: ConnectorNormalInfo = {
    type: ConnectorType.NORMAL,
    name: 'infura',
    label: 'infura',
    description: 'n/a',
    href: null,
    color: '#FFFFFF',
    mobile: true,
};

export const connector_info: {
    [key in SupportedConnectors]: ConnectorInfo;
} = {
    rainbow: connector_info_rainbow,
    metamask: connector_info_metamask,
    ledgerlive: connector_info_ledgerlive,
    trust: connector_info_trust,
    cryptodotcom: connector_info_cryptodotcom,
    coinbase: connector_info_coinbase,
    walletconnect: connector_info_walletconnect,
    infura: connector_info_infura,
};

export const peer_urls: string[] = Object.values(connector_info).reduce((prev, curr) => {
    return [...prev, ...(curr.type === ConnectorType.SPECIFIC ? [curr.peerurl] : [])];
}, [] as string[]);

export const isSpecificPeer = (provider: any) => {
    try {
        if (peer_urls.indexOf(provider.signer.connection.wc._peerMeta.url) !== -1) {
            return true;
        } else {
            return false;
        }
    } catch {
        return false;
    }
};

export const connector_instances: { [key in SupportedConnectors]: ResWithStore<Connector> } = {
    rainbow: initializeConnector<WalletConnectSpecific>(
        (actions) =>
            new WalletConnectSpecific(connector_info_rainbow, actions, {
                rpc: NETWORK_URLS,
            }),
    ),
    trust: initializeConnector<WalletConnectSpecific>(
        (actions) =>
            new WalletConnectSpecific(connector_info_trust, actions, { rpc: NETWORK_URLS }),
    ),
    cryptodotcom: initializeConnector<WalletConnectSpecific>(
        (actions) =>
            new WalletConnectSpecific(connector_info_cryptodotcom, actions, { rpc: NETWORK_URLS }),
    ),
    ledgerlive: initializeConnector<WalletConnectSpecific>(
        (actions) =>
            new WalletConnectSpecific(connector_info_ledgerlive, actions, { rpc: NETWORK_URLS }),
    ),
    coinbase: initializeConnector<WalletLink>(
        (actions) =>
            new WalletLink(connector_info_coinbase, actions, {
                url: NETWORK_URLS[1][0],
                appName: 'NuggftV1',
            }),
    ),
    walletconnect: initializeConnector<WalletConnect>(
        (actions) =>
            new WalletConnect(connector_info_walletconnect, actions, { rpc: NETWORK_URLS }),
    ),
    metamask:
        connector_info.metamask.type === ConnectorType.NORMAL
            ? initializeConnector<MetaMask>(
                  (actions) =>
                      new MetaMask(connector_info_metamask as ConnectorNormalInfo, actions, true),
              )
            : initializeConnector<WalletConnectSpecific>(
                  (actions) =>
                      new WalletConnectSpecific(
                          connector_info_metamask as ConnectorSpecificInfo,
                          actions,
                          { rpc: NETWORK_URLS },
                      ),
              ),
    infura: initializeConnector<Network>(
        (actions) => new Network(connector_info_infura, actions, NETWORK_URLS, true, 5),
        Object.keys(NETWORK_URLS).map((chainId) => Number(chainId)),
    ),
};

export const priority = getPriorityConnector(connector_instances);

export const connectors: {
    [key in SupportedConnectors]: NL.Web3.WalletInfo & ResWithStore<Connector>;
} = Object.keys(connector_instances).reduce((prev, curr: SupportedConnectors) => {
    return { ...prev, [curr]: { ...connector_instances[curr], ...connector_info[curr] } };
}, {} as any);

export const gotoLink = (link: string) => {
    let win = window.open(encodeURIComponent(link), '_blank');
    win.focus();
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

export const gotoEtherscan = (
    chainId: SupportedChainId,
    route: 'tx' | 'address',
    value: string,
) => {
    let win = window.open(`${CHAIN_INFO[chainId].explorer}${route}/${value}`, '_blank');
    win.focus();
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

export const ENS_REGISTRAR_ADDRESSES: NL.Web3.AddressMap = {
    [SupportedChainId.MAINNET]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    [SupportedChainId.ROPSTEN]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    [SupportedChainId.GOERLI]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    [SupportedChainId.RINKEBY]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
};
