import { Interface } from '@ethersproject/abi/lib/interface';
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';
import { BlockTag, Formatter, Network } from '@ethersproject/providers';

import { toEth } from '@src/lib/conversion';
import nuggftabi from '@src/abis/NuggftV1.json';

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

export const NuggftV1__Interface = new Interface(nuggftabi);

export const MIN_SALE_PRICE = toEth('.001');

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
export const FEATURE_RARITY = [8, 11, 11, 5, 5, 2, 2, 2].map(
    (x) => x / 8,
) as unknown as FixedLengthArray<number, 8>;
export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000' as const;

export const CONTRACTS = {
    [Chain.MAINNET]: {
        NuggftV1: ADDRESS_ZERO,
        xNuggftV1: ADDRESS_ZERO,
        DotnuggV1: ADDRESS_ZERO,
        Genesis: 0,
        Interval: 0,
        Offset: 1,
        MintOffset: 1000000,
    },
    [Chain.ROPSTEN]: {
        NuggftV1: '0x420690c1b1519a32fa36768dc2cefe128160a9b7',
        xNuggftV1: ADDRESS_ZERO,
        DotnuggV1: '0x420690542c8DeDDe5aF93684897CE3CA7422FE57',
        Genesis: 333,
        Interval: 32,
        Offset: 1,
        MintOffset: 1000000,
    },
    [Chain.RINKEBY]: {
        NuggftV1: '0xa95e7bf3b12f0ee4d4078dfda67c883bfbfdddea',
        xNuggftV1: '0x8404ef414f9cc31e2afb66a5b81d56bcdd407004',
        DotnuggV1: '0xb73ec6767dd7d81f0056c4ea5919c91bb7b3f274',
        Genesis: 10757312,
        Interval: 64,
        Offset: 1,
        MintOffset: 1000000,
    },
    [Chain.GOERLI]: {
        NuggftV1: '0xf5622e697d1821b8e83e4beed9e897b49de81011',
        xNuggftV1: ADDRESS_ZERO,
        DotnuggV1: '0x69c877437dc133bbf32c8bc1acfaf93ba824f28c',
        Genesis: 333,
        Interval: 32,
        Offset: 1,
        MintOffset: 1000000,
    },
} as const;

export const PROTOCOL_FEE_FRAC_MINT = 1;
export const PREMIUM_DIV = 2000;
export const DEFAULT_CONTRACTS = CONTRACTS[DEFAULT_CHAIN];

export const globalFormatter = new Formatter();

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
        etherscanApiHost: 'api.etherscan.io',
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
        etherscanApiHost: 'api-rinkeby.etherscan.io',
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
        etherscanApiHost: 'api-ropsten.etherscan.io',
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
        etherscanApiHost: 'api-goerli.etherscan.io',
    },
};

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
    readonly etherscanApiHost: string;
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

export const getCustomEtherPrice = async () => {
    try {
        const resonse = await fetch(
            `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${ETHERSCAN_KEY}`,
        );

        if (resonse.ok) {
            const { result } = (await resonse.json()) as {
                status: string;
                message: string;
                result: {
                    ethbtc: string;
                    ethbtc_timestamp: string;
                    ethusd: string;
                    ethusd_timestamp: string;
                };
            };

            return {
                ethusd: parseFloat(result.ethusd),
                ethusd_timestamp: Number(result.ethusd_timestamp),
            };
        }
        return {
            ethusd: null,
            ethusd_timestamp: null,
        };
    } catch (err) {
        return {
            ethusd: null,
            ethusd_timestamp: null,
        };
    }
};

interface EtherscanTransactionResponse {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    nonce: string;
    blockHash: string;
    transactionIndex: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gasPrice: string;
    isError: string;
    txreceipt_status: string;
    input: string;
    contractAddress: string;
    cumulativeGasUsed: string;
    gasUsed: string;
    creates: string;
    confirmations: string;
    errorCode: string;
}

export const fetchEtherscanTransactionHistory = async (
    address: AddressString,
    startBlock?: BlockTag,
    endBlock?: BlockTag,
): Promise<Array<EtherscanTransactionResponse>> => {
    // Note: The `page` page parameter only allows pagination within the
    //       10,000 window available without a page and offset parameter
    //       Error: Result window is too large, PageNo x Offset size must
    //              be less than or equal to 10000

    // const params = {
    //     action: 'txlist',
    //     address,
    //     startblock: startBlock == null ? 0 : startBlock,
    //     endblock: endBlock == null ? 99999999 : endBlock,
    //     sort: 'asc',
    // };
    try {
        const request = await fetch(
            `https://${
                CHAIN_INFO[DEFAULT_CHAIN].etherscanApiHost
            }/api?module=account&action=txlist&address=${address}&startblock=${
                startBlock ?? 0
            }&endblock=${endBlock ?? '99999999'}&sort=asc&apikey=${ETHERSCAN_KEY}`,
        );

        if (request.ok) {
            const { result } = (await request.json()) as {
                status: string;
                message: string;
                result: EtherscanTransactionResponse[];
            };

            return result;
        }
        throw new Error();
    } catch (err) {
        return [];
    }

    // // const result = (await this.fetch('account', params)) as Array<EtherscanTransactionResponse>;

    // return result.map((tx) => {
    //     ['contractAddress' as const, 'to' as const].forEach(function (key) {
    //         if (tx[key] === '') {
    //             delete tx[key];
    //         }
    //     });
    //     if (tx.creates == null && tx.contractAddress != null) {
    //         tx.creates = tx.contractAddress;
    //     }
    //     const item = this.formatter.transactionResponse(tx);

    //     Object.assign(item, {
    //         isError: Number(tx.isError) === 1,
    //         errorCode: tx.errorCode ?? null,
    //     });

    //     if (tx.timeStamp) {
    //         item.timestamp = parseInt(tx.timeStamp, 10);
    //     }

    //     return item as typeof item & { isError: boolean; errorCode: string | null };
    // });
};
