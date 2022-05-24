// eslint-disable-next-line no-shadow
export enum Chain {
    MAINNET = 1,
    ROPSTEN = 3,
    RINKEBY = 4,
    GOERLI = 5,
}

export type SupportedConnector =
    | 'rainbow'
    | 'ledgerlive'
    | 'cryptodotcom'
    | 'trust'
    | 'coinbase'
    | 'coinbasewallet'
    | 'walletconnect'
    | 'metamask'
    | 'rpc';

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
    MetaMask = 'metamask',
    CoinbaseWallet = 'coinbasewallet',
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
}

export interface PeerBaseInfo {
    type: Connector;
    peer: Peer;
    injected: boolean;
    fallback: boolean;
    name: string;
    color: string;
}

// export interface ConnectorInfo__WalletConnect extends ConnectorBaseInfo {
//     type: Connector.WalletConnect;
//     peer: WalletConnect
//     injected: false;
//     fallback: false;
// }

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

export interface PeerInfo__MetaMask extends PeerBaseInfo {
    type: Connector.MetaMask;
    peer: Peer.MetaMask;
    injected: true;
    fallback: false;
    deeplink_href: string;
    peerurl: string;
}

export interface PeerInfo__CoinbaseWallet extends PeerBaseInfo {
    type: Connector.CoinbaseWallet;
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
    | PeerInfo__MetaMask
    | PeerInfo__CoinbaseWallet;
