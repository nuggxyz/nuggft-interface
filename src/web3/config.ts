/* eslint-disable import/no-cycle */
import {
    AlchemyWebSocketProvider,
    InfuraWebSocketProvider,
    WebSocketProvider,
} from '@ethersproject/providers';
import { ethers } from 'ethers';
import { ApolloClient } from '@apollo/client';

import { buildApolloSplitLink, buildCache } from '@src/gql/config';

import { Connector } from './core/types';
import {
    Chain,
    Connector as ConnectorEnum,
    Peer,
    PeerInfo,
    PeerInfo__WalletConnect,
} from './core/interfaces';
import {
    getNetworkConnector,
    getPriorityConnector,
    getSelectedConnector,
    initializeConnector,
    ResWithStore,
} from './core/core';
import { WalletLink } from './clients/walletlink';
import { MetaMask } from './clients/metamask';
import { WalletConnect } from './clients/walletconnect';
import { Network } from './clients/network';

export function supportedChainIds() {
    // @ts-ignore
    return Object.values<Chain>(Chain);
}

export const DEFAULT_CHAIN = Chain.RINKEBY;

export const NETWORK_HEALTH_CHECK_MS = 15 * 1000;
export const DEFAULT_MS_BEFORE_WARNING = 90 * 1000;

export const INFURA_KEY = 'a1625b39cf0047febd415f9b37d8c931';
export const ALCHEMY_KEY = 'QuvT3tDt0pPE676Br4w2mhCws6vfnMlA';

export const isValidChainId = (input: number) => {
    return supportedChainIds().indexOf(input) !== -1;
};

export const FEATURE_NAMES = ['Base', 'Eyes', 'Mouth', 'Hair', 'Hat', 'Back', 'Hold', 'Neck'];

export const CONTRACTS = {
    [Chain.MAINNET]: {
        NuggftV1: ethers.constants.AddressZero,
        DotnuggV1: ethers.constants.AddressZero,
        Genesis: 0,
        Interval: 0,
    },
    [Chain.ROPSTEN]: {
        NuggftV1: '0x420690c1b1519a32fa36768dc2cefe128160a9b7',
        DotnuggV1: '0x420690542c8DeDDe5aF93684897CE3CA7422FE57',
        Genesis: 333,
        Interval: 32,
    },
    [Chain.RINKEBY]: {
        NuggftV1: '0xd94979f338081e32b74a5d84e402c619d4b30255', // 0x3f1c9c4ae47809d284592845e4ced13a6e352421
        DotnuggV1: '0x8239075908f08b64ab7818ff79652d25ae5301c6',
        Genesis: 10305984,
        Interval: 32,
    },
    [Chain.GOERLI]: {
        NuggftV1: '0x7ccd9a783e43845f3ae37e83b4a696b0cfab114c',
        DotnuggV1: '0x9a3b1be8ec7eaf472b22c9c833164297e2940f27',
        Genesis: 333,
        Interval: 32,
    },
};

export const GRAPH_ENPOINTS = {
    [Chain.MAINNET]: `https://api.thegraph.com/subgraphs/name/nuggxyz/nuggftv1-ropsten`,
    [Chain.RINKEBY]: `https://api.thegraph.com/subgraphs/name/nuggxyz/nuggftv1-rinkeby`,
    [Chain.ROPSTEN]: `https://api.thegraph.com/subgraphs/name/nuggxyz/nuggftv1-ropsten`,
    [Chain.GOERLI]: `https://api.thegraph.com/subgraphs/name/nuggxyz/nuggftv1-goerli`,
};

export const GRAPH_WSS_ENDPOINTS = {
    [Chain.MAINNET]: `wss://api.thegraph.com/subgraphs/name/nuggxyz/nuggftv1-ropsten`,
    [Chain.RINKEBY]: `wss://api.thegraph.com/subgraphs/name/nuggxyz/nuggftv1-rinkeby`,
    [Chain.ROPSTEN]: `wss://api.thegraph.com/subgraphs/name/nuggxyz/nuggftv1-ropsten`,
    [Chain.GOERLI]: `wss://api.thegraph.com/subgraphs/name/nuggxyz/nuggftv1-goerli`,
};

export const INFURA_URLS = {
    [Chain.MAINNET]: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
    [Chain.RINKEBY]: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
    [Chain.ROPSTEN]: `https://ropsten.infura.io/v3/${INFURA_KEY}`,
    [Chain.GOERLI]: `https://goerli.infura.io/v3/${INFURA_KEY}`,
};

export const ALCHEMY_URLS = {
    [Chain.MAINNET]: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
    [Chain.RINKEBY]: `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_KEY}`,
    [Chain.ROPSTEN]: `https://eth-ropsten.alchemyapi.io/v2/${ALCHEMY_KEY}`,
    [Chain.GOERLI]: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_KEY}`,
};

export const INFURA_WSS_URLS = {
    [Chain.MAINNET]: `wss://mainnet.infura.io/v3/${INFURA_KEY}`,
    [Chain.RINKEBY]: `wss://rinkeby.infura.io/v3/${INFURA_KEY}`,
    [Chain.ROPSTEN]: `wss://ropsten.infura.io/v3/${INFURA_KEY}`,
    [Chain.GOERLI]: `wss://goerli.infura.io/v3/${INFURA_KEY}`,
};

export const ALCHEMY_WSS_URLS = {
    [Chain.MAINNET]: `wss://eth-mainnet.ws.alchemyapi.io/v2/${ALCHEMY_KEY}`,
    [Chain.RINKEBY]: `wss://eth-rinkeby.ws.alchemyapi.io/v2/${ALCHEMY_KEY}`,
    [Chain.ROPSTEN]: `wss://eth-ropsten.ws.alchemyapi.io/v2/${ALCHEMY_KEY}`,
    [Chain.GOERLI]: `wss://eth-goerli.ws.alchemyapi.io/v2/${ALCHEMY_KEY}`,
};

export const peer_rainbow: PeerInfo = {
    type: ConnectorEnum.WalletConnect,
    peer: Peer.Rainbow,
    desktopAction: 'qrcode',
    injected: false,
    fallback: false,
    color: 'rgb(0,62,140)',
    name: 'Rainbow Wallet',
    deeplink_href: 'https://rnbwapp.com/',
    peerurl: 'https://rainbow.me',
};

export const peer_metamask: PeerInfo = {
    ...(window.ethereum
        ? {
              type: ConnectorEnum.MetaMask,
              injected: true,
          }
        : {
              type: ConnectorEnum.WalletConnect,
              desktopAction: 'qrcode',
              injected: false,
              peerurl: 'https://metamask.io',
              deeplink_href: 'https://metamask.app.link/',
          }),
    peer: Peer.MetaMask,
    fallback: false,
    color: 'rgba(232,131,29,1.0)',
    name: 'MetaMask',
};

export const peer_ledgerlive: PeerInfo = {
    type: ConnectorEnum.WalletConnect,
    peer: Peer.LedgerLive,
    desktopAction: 'qrcode',
    injected: false,
    fallback: false,
    color: 'rgba(0,0,0,1.0)',
    name: 'Ledger Live',
    deeplink_href: 'ledgerlive://',
    peerurl: 'https://www.ledger.com/',
};

export const peer_trust: PeerInfo = {
    type: ConnectorEnum.WalletConnect,
    peer: Peer.Trust,
    name: 'Trust Wallet',
    deeplink_href: 'https://link.trustwallet.com/',
    color: 'rgba(51,117,187,1.0)',
    peerurl: 'https://trustwallet.com/',
    injected: false,
    fallback: false,
    desktopAction: 'qrcode',
};

export const peer_cryptodotcom: PeerInfo = {
    type: ConnectorEnum.WalletConnect,
    peer: Peer.CryptoDotCom,
    name: 'Crypto.com',
    deeplink_href: 'https://wallet.crypto.com/',
    color: 'rgba(0,45,116,1.0)',
    peerurl: 'https://crypto.com/',
    injected: false,
    fallback: false,
    desktopAction: 'qrcode',
};

export const peer_coinbase: PeerInfo = {
    type: ConnectorEnum.WalletLink,
    name: 'Coinbase Wallet',
    peer: Peer.Coinbase,
    color: 'rgba(22,82,240,1.0)',
    injected: false,
    fallback: false,
};
export const peer_walletconnect: PeerInfo__WalletConnect = {
    type: ConnectorEnum.WalletConnect,
    name: 'Wallet Connect',
    peer: Peer.WalletConnect,
    deeplink_href: null,
    desktopAction: 'default',
    peerurl: null,
    color: 'rgba(65,150,252,1.0)',
    injected: false,
    fallback: false,
};
export const peer_rpc: PeerInfo = {
    type: ConnectorEnum.Rpc,
    name: 'Rpc',
    peer: Peer.Rpc,
    color: 'rgba(22,82,240,1.0)',
    injected: false,
    fallback: true,
};

export const peers: {
    [key in Peer]: PeerInfo;
} = {
    rainbow: peer_rainbow,
    metamask: peer_metamask,
    ledgerlive: peer_ledgerlive,
    trust: peer_trust,
    cryptodotcom: peer_cryptodotcom,
    coinbase: peer_coinbase,
    walletconnect: peer_walletconnect,
    rpc: peer_rpc,
};

export const connector_instances: { [key in ConnectorEnum]?: ResWithStore<Connector> } = {
    walletlink: initializeConnector<WalletLink>(
        (actions) =>
            new WalletLink(peer_coinbase, actions, {
                url: ALCHEMY_URLS[1][0],
                appName: 'NuggftV1',
            }),
    ),
    walletconnect: initializeConnector<WalletConnect>(
        (actions) =>
            new WalletConnect(
                [
                    ...(peer_metamask.type === ConnectorEnum.WalletConnect ? [peer_metamask] : []),
                    peer_walletconnect,
                    peer_rainbow,
                    peer_cryptodotcom,
                    peer_trust,
                ],
                actions,
                { rpc: ALCHEMY_URLS },
            ),
    ),
    ...(peer_metamask.type === ConnectorEnum.MetaMask
        ? {
              metamask: initializeConnector<MetaMask>(
                  (actions) => new MetaMask(peer_metamask, actions, undefined, true),
              ),
          }
        : {}),
    rpc: initializeConnector<Network>(
        (actions) =>
            new Network(
                peer_rpc,
                actions,
                supportedChainIds().reduce((prev, curr) => {
                    return { ...prev, [curr]: [ALCHEMY_URLS[curr]] };
                }, {}),
            ),
        supportedChainIds(),
    ),
};

export const priority = getPriorityConnector(connector_instances);

export const network = getNetworkConnector(connector_instances);

export const selected = getSelectedConnector();

export const gotoLink = (link: string) => {
    const win = window.open(encodeURIComponent(link), '_blank');
    if (win) win.focus();
};

export const CHAIN_INFO: {
    [key in Chain]: L1ChainInfo;
} = {
    [Chain.MAINNET]: {
        docs: 'https://docs.uniswap.org/',
        explorer: 'https://etherscan.io/',
        infoLink: 'https://nugg.xyz/',
        name: 'Ethereum',
        logoUrl: 'assets/images/ethereum-logo.png',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        label: 'mainnet',
    },
    [Chain.RINKEBY]: {
        docs: 'https://docs.uniswap.org/',
        explorer: 'https://rinkeby.etherscan.io/',
        infoLink: 'https://nugg.xyz/testing',
        name: 'Rinkeby',
        nativeCurrency: {
            name: 'Rinkeby ETH',
            symbol: 'rinkETH',
            decimals: 18,
        },
        label: 'rinkeby',
    },
    [Chain.ROPSTEN]: {
        docs: 'https://docs.uniswap.org/',
        explorer: 'https://ropsten.etherscan.io/',
        infoLink: 'https://nugg.xyz/testing',
        name: 'Ropsten',
        nativeCurrency: {
            name: 'Ropsten ETH',
            symbol: 'ropETH',
            decimals: 18,
        },
        label: 'ropsten',
    },
    [Chain.GOERLI]: {
        docs: 'https://docs.uniswap.org/',
        explorer: 'https://goerli.etherscan.io/',
        infoLink: 'https://nugg.xyz/testing',
        name: 'Görli',
        nativeCurrency: {
            name: 'Görli ETH',
            symbol: 'görETH',
            decimals: 18,
        },
        label: 'goerli',
    },
};

export const gotoEtherscan = (chainId: Chain, route: 'tx' | 'address', value: string) => {
    const win = window.open(`${CHAIN_INFO[chainId].explorer}${route}/${value}`, '_blank');
    if (win) win.focus();
};

export const createInfuraWebSocket = (chainId: Chain): WebSocketProvider => {
    return new InfuraWebSocketProvider(CHAIN_INFO[chainId].label, INFURA_KEY);
};

export const createAlchemyWebSocket = (chainId: Chain): WebSocketProvider => {
    return new AlchemyWebSocketProvider(CHAIN_INFO[chainId].label, ALCHEMY_KEY);
};

export const createApolloClient = (chainId: Chain) => {
    const ok = new ApolloClient<any>({
        link: buildApolloSplitLink(GRAPH_ENPOINTS[chainId], GRAPH_WSS_ENDPOINTS[chainId]),
        connectToDevTools: true,
        cache: buildCache(),
    });
    window.__APOLLO_CLIENT__ = ok;
    return ok;
};

export const ENS_REGISTRAR_ADDRESSES = {
    [Chain.MAINNET]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    [Chain.ROPSTEN]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    [Chain.GOERLI]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    [Chain.RINKEBY]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
};

// interface WalletInfo {
//     name: string;
//     label: string;
//     description: string;
//     href: string | null;
//     color: string;
//     primary?: true;
//     mobile?: true;
//     mobileOnly?: true;
//     peerName?: string;
//     peerurl?: string;
// }

interface L1ChainInfo {
    readonly blockWaitMsBeforeWarning?: number;
    readonly docs: string;
    readonly explorer: string;
    readonly infoLink: string;
    readonly label: string;
    readonly logoUrl?: string;
    readonly rpcUrls?: string[];
    readonly nativeCurrency: {
        name: string; // 'Goerli ETH',
        symbol: string; // 'gorETH',
        decimals: number; // 18,
    };
    readonly name: string;
}
