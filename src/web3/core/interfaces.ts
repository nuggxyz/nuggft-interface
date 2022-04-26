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
    WalletLink = 'walletlink',
    Rpc = 'rpc',
}

// eslint-disable-next-line no-shadow
export enum Peer {
    MetaMask = 'metamask',
    Rainbow = 'rainbow',
    LedgerLive = 'ledgerlive',
    Coinbase = 'coinbase',
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
    deeplink_href: string | null;
    peerurl: string | null;
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
}

export interface PeerInfo__WalletLink extends PeerBaseInfo {
    type: Connector.WalletLink;
    peer: Peer.Coinbase;

    injected: false;
    fallback: false;
}

export type PeerInfo =
    | PeerInfo__WalletConnect
    | PeerInfo__Rpc
    | PeerInfo__MetaMask
    | PeerInfo__WalletLink;
