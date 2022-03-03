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
    | 'infura';

export type SupportedWalletConnectInstances =
    | 'metamask'
    | 'rainbow'
    | 'ledgerlive'
    | 'cryptodotcom'
    | 'trust'
    | 'other';

export enum Devices {
    Mobile,
    Desktop,
    Both,
}

export enum Connector {
    WalletConnect = 'walletconnect',
    MetaMask = 'metamask',
    WalletLink = 'walletlink',
    Infura = 'infura',
}

export enum Peer {
    MetaMask = 'metamask',
    Rainbow = 'rainbow',
    LedgerLive = 'ledgerlive',
    Coinbase = 'coinbase',
    WalletConnect = 'walletconnect',
    CryptoDotCom = 'cryptodotcom',
    Trust = 'trust',
    Infura = 'infura',
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
}

export interface PeerInfo__Infura extends PeerBaseInfo {
    type: Connector.Infura;
    peer: Peer.Infura;
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
    | PeerInfo__Infura
    | PeerInfo__MetaMask
    | PeerInfo__WalletLink;
