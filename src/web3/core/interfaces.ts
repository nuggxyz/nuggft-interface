// eslint-disable-next-line no-shadow

export type SupportedConnector =
    | 'rainbow'
    | 'ledgerlive'
    | 'cryptodotcom'
    | 'trust'
    | 'coinbase'
    | 'coinbasewallet'
    | 'walletconnect'
    | 'injected'
    | 'rpc';

export type SupportedInjectedInstances = 'metamask' | 'coinbasewallet' | 'other';

export type SupportedWalletConnectInstances =
    | 'metamask'
    | 'rainbow'
    | 'ledgerlive'
    | 'cryptodotcom'
    | 'trust'
    | 'other';

// eslint-disable-next-line no-shadow
export enum Devices {
    Mobile,
    Desktop,
    Both,
}

// eslint-disable-next-line no-shadow
export enum Connector {
    WalletConnect = 'walletconnect',
    Injected = 'injected',
    CoinbaseWalletSDK = 'coinbasewalletsdk',
    Coinbase = 'coinbase',
    Rpc = 'rpc',
}

// eslint-disable-next-line no-shadow
export enum Peer {
    MetaMask = 'metamask',
    Rainbow = 'rainbow',
    LedgerLive = 'ledgerlive',
    Coinbase = 'coinbase',
    CoinbaseWallet = 'coinbasewallet',
    WalletConnect = 'walletconnect',
    CryptoDotCom = 'cryptodotcom',
    Trust = 'trust',
    Rpc = 'rpc',
    GenericInjected = 'injected',
    Brave = 'brave',
}

export interface PeerBaseInfo {
    type: Connector;
    peer: Peer;
    injected: boolean;
    icon: string;
    fallback: boolean;
    name: string;
    color: string;
}

export interface PeerInfo__WalletConnect extends PeerBaseInfo {
    type: Connector.WalletConnect;
    peer:
        | Peer.MetaMask
        | Peer.CryptoDotCom
        | Peer.Rainbow
        | Peer.Trust
        | Peer.LedgerLive
        | Peer.WalletConnect;
    desktopAction: 'qrcode' | 'deeplink' | 'default';
    deeplink_href: string;
    peerurl: string;
    injected: false;
    fallback: false;
    ios_href?: string;
    android_href?: string;
}

export interface PeerInfo__Rpc extends PeerBaseInfo {
    type: Connector.Rpc;
    peer: Peer.Rpc;
    injected: false;
    fallback: true;
}

export interface PeerInfo__Injected extends PeerBaseInfo {
    type: Connector.Injected;
    peer: Peer.MetaMask | Peer.CoinbaseWallet | Peer.Brave | Peer.GenericInjected;
    injected: true;
    fallback: false;
    deeplink_href: string;
    peerurl: string;
}

export interface PeerInfo__CoinbaseWalletSDK extends PeerBaseInfo {
    type: Connector.CoinbaseWalletSDK;
    peer: Peer.CoinbaseWallet;
    deeplink_href: string;
    injected: false;
    fallback: false;
}

export interface PeerInfo__Coinbase extends PeerBaseInfo {
    type: Connector.Coinbase;
    peer: Peer.Coinbase;
    deeplink_href: string;
    injected: false;
    fallback: false;
}
export type PeerInfo =
    | PeerInfo__Coinbase
    | PeerInfo__WalletConnect
    | PeerInfo__Rpc
    | PeerInfo__Injected
    | PeerInfo__CoinbaseWalletSDK;
