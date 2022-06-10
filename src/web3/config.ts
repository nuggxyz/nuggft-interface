/* eslint-disable import/no-cycle */
import { useEffect } from 'react';
import { ApolloClient } from '@apollo/client';
import { InfuraProvider, JsonRpcProvider, Log } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';

import { buildApolloHttpLink, buildCache } from '@src/gql';
import * as constants from '@src/lib/constants';
import { EthInt, Fraction } from '@src/classes/Fraction';
import { ETH_ONE, LOSS } from '@src/lib/conversion';
import emitter from '@src/emitter';
import { NuggftV1__factory } from '@src/typechain';
import { InterfacedEvent } from '@src/interfaces/events';
import {
    Chain,
    Connector as ConnectorEnum,
    Peer,
    PeerInfo,
    PeerInfo__WalletConnect,
    PeerInfo__Coinbase,
    PeerInfo__Injected,
    PeerInfo__CoinbaseWalletSDK,
} from '@src/web3/core/interfaces';

import { Connector } from './core/types';
import {
    getNetworkConnector,
    getPriorityConnector,
    getSelectedConnector,
    initializeConnector,
    ResWithStore,
} from './core/core';
import { Injected } from './clients/injected';
import { WalletConnect } from './clients/walletconnect';
import { Network as NetworkConnector } from './clients/network';
import {
    InfuraWebSocketProvider,
    CustomWebSocketProvider,
    AlchemyWebSocketProvider,
} from './classes/CustomWebSocketProvider';
import { CoinbaseWallet } from './clients/coinbasewallet';
import {
    DEFAULT_CONTRACTS,
    calculateEpochId,
    ALCHEMY_KEY,
    CHAIN_INFO,
    DEFAULT_CHAIN,
    GRAPH_ENPOINTS,
    INFURA_KEY,
    PREMIUM_DIV,
    PROTOCOL_FEE_FRAC_MINT,
    supportedChainIds,
    ALCHEMY_URLS,
} from './constants';
import { CustomEtherscanProvider } from './classes/CustomEtherscanProvider';

export default { ...constants };

export const peer_rainbow: PeerInfo__WalletConnect = {
    type: ConnectorEnum.WalletConnect,
    peer: Peer.Rainbow,
    desktopAction: 'qrcode',
    injected: false,
    fallback: false,
    color: 'rgb(0,62,140)',
    name: 'Rainbow Wallet',
    deeplink_href: 'https://rnbwapp.com/',
    ios_href: 'ios-app://1457119021/rainbow/open?',
    android_href: 'android-app://me.rainbow/rainbow/open?',
    peerurl: 'https://rainbow.me',
} as const;

export const isInjectedCoinbaseWallet = () => {
    if (window.ethereum && window.ethereum.providers) {
        for (let i = 0; i < window.ethereum.providers.length; i++) {
            const { isCoinbaseWallet, isCoinbaseBrowser } = window.ethereum.providers[i];
            if (isCoinbaseWallet || isCoinbaseBrowser) return true;
        }
    }
    return false;
};

const peer_metamask_base = {
    peer: Peer.MetaMask,
    fallback: false,
    color: 'rgba(232,131,29,1.0)',
    name: 'MetaMask',
    peerurl: 'https://metamask.io',
    deeplink_href: 'https://metamask.app.link/',
} as const;

export const peer_metamask_injected: PeerInfo__Injected = {
    type: ConnectorEnum.Injected,
    injected: true,
    ...peer_metamask_base,
};

export const peer_metamask_walletconnect: PeerInfo__WalletConnect = {
    type: ConnectorEnum.WalletConnect,
    desktopAction: 'qrcode',
    injected: false,
    ...peer_metamask_base,
};

export const peer_brave_injected: PeerInfo__Injected = {
    peer: Peer.Brave,
    fallback: false,
    color: 'rgba(232,131,29,1.0)',
    name: 'Brave',
    peerurl: 'https://metamask.io',
    deeplink_href: 'https://metamask.app.link/',
    type: ConnectorEnum.Injected,
    injected: true,
} as const;

export const peer_generic_injected: PeerInfo__Injected = {
    peer: Peer.GenericInjected,
    fallback: false,
    color: 'rgba(232,131,29,1.0)',
    name: 'Injected',
    peerurl: 'https://metamask.io',
    deeplink_href: 'https://metamask.app.link/',
    type: ConnectorEnum.Injected,
    injected: true,
} as const;

export const peer_ledgerlive: PeerInfo__WalletConnect = {
    type: ConnectorEnum.WalletConnect,
    peer: Peer.LedgerLive,
    desktopAction: 'qrcode',
    injected: false,
    fallback: false,
    color: 'rgba(0,0,0,1.0)',
    name: 'Ledger Live',
    deeplink_href: 'ledgerlive://',

    peerurl: 'https://www.ledger.com/',
} as const;

export const peer_trust: PeerInfo__WalletConnect = {
    type: ConnectorEnum.WalletConnect,
    peer: Peer.Trust,
    name: 'Trust Wallet',
    deeplink_href: 'https://link.trustwallet.com/',
    color: 'rgba(51,117,187,1.0)',
    peerurl: 'https://trustwallet.com/',
    injected: false,
    fallback: false,
    desktopAction: 'qrcode',
} as const;

export const peer_cryptodotcom: PeerInfo__WalletConnect = {
    type: ConnectorEnum.WalletConnect,
    peer: Peer.CryptoDotCom,
    name: 'Crypto.com',
    deeplink_href: 'https://wallet.crypto.com/',
    color: 'rgba(0,45,116,1.0)',
    peerurl: 'https://crypto.com/',
    injected: false,
    fallback: false,
    desktopAction: 'qrcode',
} as const;

export const peer_coinbase: PeerInfo__Coinbase = {
    type: ConnectorEnum.Coinbase,
    name: 'Coinbase',
    peer: Peer.Coinbase,
    color: 'rgba(22,82,240,1.0)',
    injected: false,
    fallback: false,
    deeplink_href: '',
} as const;

const peer_coinbasewallet_base = {
    name: 'Coinbase Wallet',
    peer: Peer.CoinbaseWallet,
    color: 'rgba(22,82,240,1.0)',
    fallback: false,
    deeplink_href: 'https://go.cb-w.com/dapp/',
} as const;

export const peer_coinbasewallet_injected: PeerInfo__Injected = {
    type: ConnectorEnum.Injected,
    injected: true,
    peerurl: 'https://www.coinbase.com/wallet',
    ...peer_coinbasewallet_base,
};

export const peer_coinbasewallet_sdk: PeerInfo__CoinbaseWalletSDK = {
    ...peer_coinbasewallet_base,
    type: ConnectorEnum.CoinbaseWalletSDK,
    injected: false,
};

export const peer_walletconnect: PeerInfo__WalletConnect = {
    type: ConnectorEnum.WalletConnect,
    name: 'Wallet Connect',
    peer: Peer.WalletConnect,
    deeplink_href: 'null',
    desktopAction: 'default',
    peerurl: 'null',
    color: 'rgba(65,150,252,1.0)',
    injected: false,
    fallback: false,
} as const;

export const peer_rpc: PeerInfo = {
    type: ConnectorEnum.Rpc,
    name: 'Rpc',
    peer: Peer.Rpc,
    color: 'rgba(22,82,240,1.0)',
    injected: false,
    fallback: true,
} as const;

export const peers = {
    coinbasewallet:
        window.ethereum && isInjectedCoinbaseWallet()
            ? peer_coinbasewallet_injected
            : peer_coinbasewallet_sdk,
    metamask: window.ethereum ? peer_metamask_injected : peer_metamask_walletconnect,
    rainbow: peer_rainbow,
    ledgerlive: peer_ledgerlive,
    trust: peer_trust,
    cryptodotcom: peer_cryptodotcom,
    // coinbase: peer_coinbase,

    walletconnect: peer_walletconnect,
    rpc: peer_rpc,
} as const;

// // console.log(peers);

export const connector_instances: { [key in ConnectorEnum]?: ResWithStore<Connector> } = {
    walletconnect: initializeConnector<WalletConnect>(
        (actions) =>
            new WalletConnect(
                [
                    peer_metamask_walletconnect,
                    peer_walletconnect,
                    peer_rainbow,
                    peer_cryptodotcom,
                    peer_trust,
                ],

                actions,
                { rpc: { ...ALCHEMY_URLS }, chainId: DEFAULT_CHAIN },
            ),
    ),
    ...(window.ethereum
        ? {
              injected: initializeConnector<Injected>(
                  (actions) =>
                      new Injected(
                          [
                              peer_metamask_injected,
                              peer_coinbasewallet_injected,
                              peer_brave_injected,
                              peer_generic_injected,
                          ],
                          actions,
                          undefined,
                          true,
                      ),
              ),
          }
        : {}),
    coinbasewalletsdk: initializeConnector<CoinbaseWallet>(
        (actions) =>
            new CoinbaseWallet(peer_coinbasewallet_sdk, actions, {
                url: ALCHEMY_URLS[DEFAULT_CHAIN],
                appName: 'NuggftV1',
            }),
    ),
    rpc: initializeConnector<NetworkConnector>(
        (actions) =>
            new NetworkConnector(
                peer_rpc,
                actions,
                supportedChainIds().reduce((prev, curr) => {
                    return { ...prev, [curr]: [ALCHEMY_URLS[curr]] };
                }, {}),
                true,
            ),
        supportedChainIds(),
    ),
};

export const priority = getPriorityConnector(connector_instances);

export const network = getNetworkConnector(connector_instances);

export const selected = getSelectedConnector();

export const gotoDeepLink = (link: string) => {
    window?.open(link);
};

export const gotoLink = (link: string) => {
    const win = window.open(link, '_blank');
    if (win) win.focus();
};

export const gotoEtherscan = (chainId: Chain, route: 'tx' | 'address', value: string) => {
    const win = window.open(`${CHAIN_INFO[chainId].explorer}${route}/${value}`, '_blank');
    if (win) win.focus();
};

export const createInfuraWebSocket = (
    chainId: Chain = DEFAULT_CHAIN,
    onClose: (e: CloseEvent) => void = () => undefined,
): CustomWebSocketProvider => {
    return new InfuraWebSocketProvider(CHAIN_INFO[chainId].label, INFURA_KEY, onClose);
};

export const createInfuraProvider = (chainId: Chain): JsonRpcProvider => {
    return new InfuraProvider(CHAIN_INFO[chainId].label, INFURA_KEY);
};

export const createAlchemyWebSocket = (
    chainId: Chain,
    onClose: (e: CloseEvent) => void,
): CustomWebSocketProvider => {
    return new AlchemyWebSocketProvider(CHAIN_INFO[chainId].label, ALCHEMY_KEY, onClose);
};

export const apolloClient = new ApolloClient<any>({
    link: buildApolloHttpLink(GRAPH_ENPOINTS[DEFAULT_CHAIN]),
    // connectToDevTools: true,
    cache: buildCache(),
    defaultOptions: {
        query: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'all',
        },
    },
});

// @ts-ignore
// delete apolloClient.cache;

export const useActivate = () => {
    useEffect(() => {
        [
            connector_instances.injected,
            connector_instances.walletconnect,
            connector_instances.coinbasewalletsdk,
        ].forEach((x) => {
            if (x !== undefined && x.connector && x.connector.connectEagerly)
                void x.connector.connectEagerly(DEFAULT_CHAIN);
        });

        const { rpc } = connector_instances;

        if (rpc !== undefined && rpc.connector && rpc.connector.activate) {
            void rpc.connector.activate(DEFAULT_CHAIN);
        }
    }, []);

    return null;
};

export const calculateMsp = (shares: BigNumber, eth: BigNumber) => {
    if (!shares.eq(BigNumber.from(0))) {
        const ethPerShare = new Fraction(eth, shares.mul(ETH_ONE));
        const protocolFee = ethPerShare.divide(PROTOCOL_FEE_FRAC_MINT);
        const premium = ethPerShare.multiply(shares).divide(PREMIUM_DIV);
        const res = ethPerShare.add(protocolFee).add(premium);

        if (!res.bignumber.mod(LOSS).isZero()) {
            return new EthInt(res.bignumber.div(LOSS).mul(LOSS).add(LOSS));
        }

        return res;
    }
    return new EthInt(0);
};

export const calculateIncrement = (epoch?: number, blocknum?: number) => {
    if (epoch && blocknum) {
        const currepoch = calculateEpochId(blocknum);

        if (epoch === currepoch) {
            const increment = DEFAULT_CONTRACTS.Interval - (blocknum % DEFAULT_CONTRACTS.Interval);

            if (increment < 45) return BigInt(50 - (increment / 5) * 5);
        }
    }

    return BigInt(5);
};

export const calculateIncrementWithRemaining = (
    epoch?: number | null,
    blocknum?: number | null,
    hasNoBids?: boolean | null,
) => {
    if (epoch && blocknum) {
        const currepoch = calculateEpochId(blocknum);
        if (epoch >= currepoch) {
            let increment = DEFAULT_CONTRACTS.Interval - (blocknum % DEFAULT_CONTRACTS.Interval);
            const extra = DEFAULT_CONTRACTS.Interval * (epoch - currepoch);
            increment += extra;

            if (hasNoBids) {
                return [BigInt(5), increment, extra + DEFAULT_CONTRACTS.Interval] as const;
            }

            if (increment < 45) {
                const num = 50 - Math.floor(increment / 5) * 5;
                return [BigInt(num), increment % 5, 5] as const;
            }

            return [BigInt(5), increment - 45, extra + DEFAULT_CONTRACTS.Interval - 45] as const;
        }
    }

    return [BigInt(5), 100, 100] as const;
};
const inter = NuggftV1__factory.createInterface();

const etherscan = new CustomEtherscanProvider(Chain.MAINNET);

let triggered = false;

export const buildRpcWebsocket = () => {
    const eventListener = (log: Log) => {
        const event = inter.parseLog(log) as unknown as InterfacedEvent;
        emitter.emit(emitter.events.IncomingRpcEvent, { data: event, log });
    };

    const blockListener = (log: number) => {
        if (log === 0) return;
        emitter.emit(emitter.events.IncomingRpcBlock, { data: log });

        if (!triggered || log % 5 === 0) {
            if (!triggered) triggered = true;
            void etherscan
                .getCustomEtherPrice()
                .then((price) => {
                    emitter.emit(emitter.events.IncomingEtherscanPrice, {
                        data: price,
                    });
                })
                .catch(() => {
                    emitter.emit(emitter.events.IncomingEtherscanPrice, {
                        data: null,
                    });
                });
        }
    };
    const _rpc = createInfuraWebSocket(undefined, () => {});

    void _rpc.getBlockNumber().then(blockListener);

    _rpc.on('block', blockListener);

    const event = {
        address: DEFAULT_CONTRACTS.NuggftV1,
        topics: [],
    };
    _rpc.on(event, eventListener);

    _rpc.setOnClose(() => {
        _rpc.removeAllListeners('block');
        _rpc.removeAllListeners(event);
        void _rpc.destroy();
        buildRpcWebsocket();
    });

    return () => {
        _rpc.closer();
    };
};
