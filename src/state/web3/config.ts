import { InjectedConnector } from '@web3-react/injected-connector';

import { NetworkConnector } from './connectors/NetworkConnector';

export enum SupportedChainId {
    MAINNET = 1,
    ROPSTEN = 3,
    RINKEBY = 4,
    GOERLI = 5,
    KOVAN = 42,
}

export default class Web3Config {
    static SupportedChainId = SupportedChainId;
    static get supportedChainIds() {
        // @ts-ignore
        return Object.values<number>(SupportedChainId);
    }

    static NETWORK_HEALTH_CHECK_MS = 15 * 1000;
    static DEFAULT_MS_BEFORE_WARNING = 0.5 * 60 * 1000;

    static INFURA_KEY = 'a1625b39cf0047febd415f9b37d8c931';

    static NETWORK_URLS = {
        [Web3Config.SupportedChainId
            .MAINNET]: `https://mainnet.infura.io/v3/${Web3Config.INFURA_KEY}`,
        [Web3Config.SupportedChainId
            .RINKEBY]: `https://rinkeby.infura.io/v3/${Web3Config.INFURA_KEY}`,
        [Web3Config.SupportedChainId
            .ROPSTEN]: `https://ropsten.infura.io/v3/${Web3Config.INFURA_KEY}`,
        [Web3Config.SupportedChainId
            .GOERLI]: `https://goerli.infura.io/v3/${Web3Config.INFURA_KEY}`,
        [Web3Config.SupportedChainId
            .KOVAN]: `https://kovan.infura.io/v3/${Web3Config.INFURA_KEY}`,
    };

    static connectors = {
        network: new NetworkConnector({
            urls: Web3Config.NETWORK_URLS,
            defaultChainId: 3,
        }),
        injected: new InjectedConnector({
            supportedChainIds: Web3Config.supportedChainIds,
        }),
    };
    static SUPPORTED_WALLETS: { [key: string]: NL.Redux.Web3.WalletInfo } = {
        INJECTED: {
            connector: Web3Config.connectors.injected,
            name: 'Injected',
            iconURL: 'injected',
            description: 'Injected web3 provider.',
            href: null,
            color: '#010101',
            primary: true,
        },
        METAMASK: {
            connector: Web3Config.connectors.injected,
            name: 'MetaMask',
            iconURL: 'metamask',
            description: 'Easy-to-use browser extension.',
            href: null,
            color: '#E8831D',
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
        [SupportedChainId.KOVAN]: {
            docs: 'https://docs.uniswap.org/',
            explorer: 'https://kovan.etherscan.io/',
            infoLink: 'https://info.uniswap.org/#/',
            label: 'Kovan',
            nativeCurrency: {
                name: 'Kovan ETH',
                symbol: 'kovETH',
                decimals: 18,
            },
        },
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
        [Web3Config.SupportedChainId.MAINNET]:
            '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
        [Web3Config.SupportedChainId.ROPSTEN]:
            '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
        [Web3Config.SupportedChainId.GOERLI]:
            '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
        [Web3Config.SupportedChainId.RINKEBY]:
            '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    };
}
