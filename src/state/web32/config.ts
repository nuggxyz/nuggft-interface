import { ethers } from 'ethers';

import { getPriorityConnector, getSelectedConnector, initializeConnector } from './utils/core';
import { MetaMask } from './utils/metamask';
import { Network } from './utils/network';
import { WalletConnect } from './utils/walletconnect';
import { WalletLink } from './utils/walletlink';

export enum SupportedChainId {
    MAINNET = 1,
    ROPSTEN = 3,
    RINKEBY = 4,
    GOERLI = 5,
    KOVAN = 42,
}

export default class config {
    static SupportedChainId = SupportedChainId;
    static get supportedChainIds() {
        // @ts-ignore
        return Object.values<number>(SupportedChainId);
    }

    static DEFAULT_CHAIN = 5;

    static NETWORK_HEALTH_CHECK_MS = 15 * 1000;
    static DEFAULT_MS_BEFORE_WARNING = 90 * 1000;

    static INFURA_KEY = 'a1625b39cf0047febd415f9b37d8c931';

    static CONTRACTS = {
        [config.SupportedChainId.MAINNET]: {
            NuggftV1: ethers.constants.AddressZero,
            DotnuggV1: ethers.constants.AddressZero,
        },
        [config.SupportedChainId.ROPSTEN]: {
            NuggftV1: '0x420690c1b1519a32fa36768dc2cefe128160a9b7',
            DotnuggV1: '0x420690542c8DeDDe5aF93684897CE3CA7422FE57',
        },
        [config.SupportedChainId.RINKEBY]: {
            NuggftV1: '0x47f7100Fd49A162A08D000202eb68145Aa9CeBaC',
            DotnuggV1: '0x6039df117f2d6e805d90114809ca3769a2f50ddb',
        },
        [config.SupportedChainId.GOERLI]: {
            NuggftV1: '0x7ccd9a783e43845f3ae37e83b4a696b0cfab114c',
            DotnuggV1: '0x9a3b1be8ec7eaf472b22c9c833164297e2940f27',
        },
    };

    static GRAPH_ENPOINTS = {
        [config.SupportedChainId
            .MAINNET]: `https://api.thegraph.com/subgraphs/name/nuggxyz/nuggftv1-mainnet`,
        [config.SupportedChainId
            .RINKEBY]: `https://api.thegraph.com/subgraphs/name/nuggxyz/nuggftv1-rinkeby`,
        [config.SupportedChainId
            .ROPSTEN]: `https://api.thegraph.com/subgraphs/name/nuggxyz/nuggftv1-ropsten`,
        [config.SupportedChainId
            .GOERLI]: `https://api.thegraph.com/subgraphs/name/nuggxyz/nuggftv1-goerli`,
    };

    static NETWORK_URLS = {
        [config.SupportedChainId.MAINNET]: `https://mainnet.infura.io/v3/${config.INFURA_KEY}`,
        [config.SupportedChainId.RINKEBY]: `https://rinkeby.infura.io/v3/${config.INFURA_KEY}`,
        [config.SupportedChainId.ROPSTEN]: `https://ropsten.infura.io/v3/${config.INFURA_KEY}`,
        [config.SupportedChainId.GOERLI]: `https://goerli.infura.io/v3/${config.INFURA_KEY}`,
        // [config.SupportedChainId
        //     .KOVAN]: `https://kovan.infura.io/v3/${config.INFURA_KEY}`,
    };

    static WSS_URLS = {
        [config.SupportedChainId.MAINNET]: `wss://mainnet.infura.io/v3/${config.INFURA_KEY}`,
        [config.SupportedChainId.RINKEBY]: `wss://rinkeby.infura.io/v3/${config.INFURA_KEY}`,
        [config.SupportedChainId.ROPSTEN]: `wss://ropsten.infura.io/v3/${config.INFURA_KEY}`,
        [config.SupportedChainId.GOERLI]: `wss://goerli.infura.io/v3/${config.INFURA_KEY}`,
    };

    static get priority() {
        return getPriorityConnector(...Object.values(config.connectors).map((x) => x));
    }

    static get selected() {
        return getSelectedConnector(...Object.values(config.connectors).map((x) => x));
    }

    static connectors = {
        metamask: initializeConnector<MetaMask>((actions) => new MetaMask(actions)),
        walletconnect: initializeConnector<WalletConnect>(
            (actions) =>
                new WalletConnect(actions, {
                    rpc: config.NETWORK_URLS,
                }),
            Object.keys(config.NETWORK_URLS).map((chainId) => Number(chainId)),
        ),
        walletlink: initializeConnector<WalletLink>(
            (actions) =>
                new WalletLink(actions, {
                    url: config.NETWORK_URLS[1][0],
                    appName: 'web3-react',
                }),
        ),
        network: initializeConnector<Network>(
            (actions) => new Network(actions, config.NETWORK_URLS),
            Object.keys(config.NETWORK_URLS).map((chainId) => Number(chainId)),
        ),
    };
    static SUPPORTED_WALLETS: { [key: string]: NL.Redux.Web32.WalletInfo } = {
        METAMASK: {
            connector: config.connectors.metamask,
            name: 'MetaMask',
            iconURL: 'metamask',
            description: 'Easy-to-use browser extension.',
            href: null,
            color: '#E8831D',
        },
        WALLET_CONNECT: {
            connector: config.connectors.walletconnect,
            name: 'WalletConnect',
            iconURL: 'walletConnect',
            description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
            href: null,
            color: '#4196FC',
            mobile: true,
        },
        WALLET_LINK: {
            connector: config.connectors.walletlink,
            name: 'Coinbase',
            iconURL: 'walletConnect',
            description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
            href: null,
            color: '#4196FC',
            mobile: true,
        },
    };

    static CHAIN_INFO = {
        [SupportedChainId.MAINNET]: {
            docs: 'https://docs.uniswap.org/',
            explorer: 'https://etherscan.io/',
            infoLink: 'https://info.uniswap.org/#/',
            label: 'Ethereum',
            logoUrl: 'assets/images/ethereum-logo.png',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        },
        [SupportedChainId.RINKEBY]: {
            docs: 'https://docs.uniswap.org/',
            explorer: 'https://rinkeby.etherscan.io/',
            infoLink: 'https://info.uniswap.org/#/',
            label: 'Rinkeby',
            nativeCurrency: {
                name: 'Rinkeby ETH',
                symbol: 'rinkETH',
                decimals: 18,
            },
        },
        [SupportedChainId.ROPSTEN]: {
            docs: 'https://docs.uniswap.org/',
            explorer: 'https://ropsten.etherscan.io/',
            infoLink: 'https://info.uniswap.org/#/',
            label: 'Ropsten',
            nativeCurrency: {
                name: 'Ropsten ETH',
                symbol: 'ropETH',
                decimals: 18,
            },
        },
        // [SupportedChainId.KOVAN]: {
        //     docs: 'https://docs.uniswap.org/',
        //     explorer: 'https://kovan.etherscan.io/',
        //     infoLink: 'https://info.uniswap.org/#/',
        //     label: 'Kovan',
        //     nativeCurrency: {
        //         name: 'Kovan ETH',
        //         symbol: 'kovETH',
        //         decimals: 18,
        //     },
        // },
        [SupportedChainId.GOERLI]: {
            docs: 'https://docs.uniswap.org/',
            explorer: 'https://goerli.etherscan.io/',
            infoLink: 'https://info.uniswap.org/#/',
            label: 'Görli',
            nativeCurrency: {
                name: 'Görli ETH',
                symbol: 'görETH',
                decimals: 18,
            },
        },
    };

    static ENS_REGISTRAR_ADDRESSES: NL.Redux.Web3.AddressMap = {
        [config.SupportedChainId.MAINNET]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
        [config.SupportedChainId.ROPSTEN]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
        [config.SupportedChainId.GOERLI]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
        [config.SupportedChainId.RINKEBY]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    };
}
