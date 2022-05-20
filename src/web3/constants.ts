/* eslint-disable import/no-cycle */
import { BigNumber, ethers } from 'ethers';
import { Network } from '@ethersproject/providers';

export function supportedChainIds() {
    // @ts-ignore
    return Object.values<Chain>(Chain);
}

export enum Chain {
    MAINNET = 1,
    ROPSTEN = 3,
    RINKEBY = 4,
    GOERLI = 5,
}

export enum ConnectorEnum {
    WalletConnect = 'walletconnect',
    MetaMask = 'metamask',
    CoinbaseWallet = 'coinbasewallet',
    Rpc = 'rpc',
}

export const DEFAULT_CHAIN = Chain.RINKEBY;

export const NETWORK_HEALTH_CHECK_MS = 15 * 1000;
export const DEFAULT_MS_BEFORE_WARNING = 90 * 1000;

export const INFURA_KEY = process.env.NUGG_APP_INFURA_KEY as string;
export const ALCHEMY_KEY = process.env.NUGG_APP_ALCHEMY_KEY as string;
export const ETHERSCAN_KEY = process.env.NUGG_APP_ETHERSCAN_KEY as string;

export const isValidChainId = (input: number) => {
    return supportedChainIds().indexOf(input) !== -1;
};

export const FEATURE_NAMES = [
    'Base',
    'Eyes',
    'Mouth',
    'Hair',
    'Hat',
    'Back',
    'Hold',
    'Neck',
] as unknown as FixedLengthArray<string, 8>;

// chances any nugg will have get a given feature
export const FEATURE_RARITY = [8, 10, 10, 5, 5, 2, 2, 2].map(
    (x) => x / 8,
) as unknown as FixedLengthArray<number, 8>;

export const CONTRACTS = {
    [Chain.MAINNET]: {
        NuggftV1: ethers.constants.AddressZero,
        xNuggftV1: ethers.constants.AddressZero,
        DotnuggV1: ethers.constants.AddressZero,
        Genesis: 0,
        Interval: 0,
        Offset: 1,
        MintOffset: 1000000,
        GraphId: 'QmNYd7mzNPnpt4yEB6VvzuboaRKWr1pScXP3jAvAKzXrhv',
    },
    [Chain.ROPSTEN]: {
        NuggftV1: '0x420690c1b1519a32fa36768dc2cefe128160a9b7',
        xNuggftV1: ethers.constants.AddressZero,
        DotnuggV1: '0x420690542c8DeDDe5aF93684897CE3CA7422FE57',
        Genesis: 333,
        Interval: 32,
        Offset: 1,
        MintOffset: 1000000,
        GraphId: 'QmNYd7mzNPnpt4yEB6VvzuboaRKWr1pScXP3jAvAKzXrhv',
    },
    [Chain.RINKEBY]: {
        NuggftV1: '0x0a0b5f32b72c0b5269750050e287bffb33748452',
        xNuggftV1: '0x379d0837021278c2dee2d19f9fb9ae2f398753e7',
        DotnuggV1: '0x7ee8eda42872973380ff3f67fdf11ab02e74184c',
        Genesis: 10682432,
        Interval: 64,
        Offset: 1,
        MintOffset: 1000000,
        GraphId: 'QmVzfjtGvQVwfYCp76FAoKkivzaTP3mumvnb8Y5Vr5YxBB',
    },
    [Chain.GOERLI]: {
        NuggftV1: '0xf5622e697d1821b8e83e4beed9e897b49de81011',
        xNuggftV1: ethers.constants.AddressZero,
        DotnuggV1: '0x69c877437dc133bbf32c8bc1acfaf93ba824f28c',
        Genesis: 333,
        Interval: 32,
        Offset: 1,
        MintOffset: 1000000,
        GraphId: 'QmNYd7mzNPnpt4yEB6VvzuboaRKWr1pScXP3jAvAKzXrhv',
    },
} as const;

export const DEFAULT_CONTRACTS = CONTRACTS[DEFAULT_CHAIN];

export const calculateStartBlock = (epoch: BigNumberish, chainId: Chain = DEFAULT_CHAIN) => {
    return BigNumber.from(epoch)
        .sub(CONTRACTS[chainId].Offset)
        .mul(CONTRACTS[chainId].Interval)
        .add(CONTRACTS[chainId].Genesis)
        .toNumber();
};

export const calculateEpochId = (blocknum: number, chainId: Chain = DEFAULT_CHAIN) => {
    if (!CONTRACTS[chainId].Interval) return 0;
    return BigNumber.from(blocknum)
        .sub(CONTRACTS[chainId].Genesis)
        .div(CONTRACTS[chainId].Interval)
        .add(CONTRACTS[chainId].Offset)
        .toNumber();
};

export const calculateEndBlock = (epoch: number, chainId: Chain = DEFAULT_CHAIN) => {
    return calculateStartBlock(epoch + 1, chainId) - 1;
};

// QmXAhEeSBXYA227ER3YK9NBE57HhpVGGWeYWQhic4nPZ6M

export const GRAPH_ENPOINTS = {
    [Chain.MAINNET]: `https://api.thegraph.com/subgraphs/name/nuggxyz/nuggftv1-mainnet`,
    [Chain.RINKEBY]: `https://api.thegraph.com/subgraphs/name/nuggxyz/nuggftv1-rinkeby`,
    [Chain.ROPSTEN]: `https://api.thegraph.com/subgraphs/name/nuggxyz/nuggftv1-ropsten`,
    [Chain.GOERLI]: `https://api.thegraph.com/subgraphs/name/nuggxyz/nuggftv1-goerli`,
};

export const GRAPH_WSS_ENDPOINTS = {
    [Chain.MAINNET]: `wss://api.thegraph.com/subgraphs/name/nuggxyz/nuggftv1-mainnet`,
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

// export const createInfuraWebSocket = (
//     chainId: Chain = DEFAULT_CHAIN,
//     onClose: (e: CloseEvent) => void = () => undefined,
// ): CustomWebSocketProvider => {
//     return new InfuraWebSocketProvider(CHAIN_INFO[chainId].label, INFURA_KEY, onClose);
// };

// export const createInfuraProvider = (chainId: Chain): JsonRpcProvider => {
//     return new InfuraProvider(CHAIN_INFO[chainId].label, INFURA_KEY);
// };

// export const createAlchemyWebSocket = (
//     chainId: Chain,
//     onClose: (e: CloseEvent) => void,
// ): CustomWebSocketProvider => {
//     return new AlchemyWebSocketProvider(CHAIN_INFO[chainId].label, ALCHEMY_KEY, onClose);
// };

// export const apolloClient = new ApolloClient<any>({
//     link: buildApolloSplitLink(GRAPH_ENPOINTS[DEFAULT_CHAIN], GRAPH_WSS_ENDPOINTS[DEFAULT_CHAIN]),
//     // connectToDevTools: true,
//     cache: buildCache(),
// });

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

export const ENS_REGISTRAR_ADDRESSES = {
    [Chain.MAINNET]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    [Chain.ROPSTEN]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    [Chain.GOERLI]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    [Chain.RINKEBY]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
};

export const getNetwork = (chainId: Chain): Network => ({
    name: CHAIN_INFO[chainId].label,
    chainId,
    ensAddress: ENS_REGISTRAR_ADDRESSES[chainId],
});
