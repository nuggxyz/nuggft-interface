import type { EventEmitter } from 'node:events';

import type { IWCEthRpcConnectionOptions } from '@walletconnect/types';
import type { SignerConnection } from '@walletconnect/signer-connection';
import type Core from '@walletconnect/core';
import type SocketTransport from '@walletconnect/socket-transport';
import EventEmitter3 from 'eventemitter3';
import curriedLighten from 'polished/lib/color/lighten';
import { JsonRpcProvider } from '@ethersproject/providers';

import type { Actions, ProviderRpcError } from '@src/web3/core/types';
import { Connector, WalletConnectCoreProvider } from '@src/web3/core/types';
import { getBestUrl } from '@src/web3/core/utils';
import {
    PeerInfo__WalletConnect,
    Peer,
    Connector as ConnectorEnum,
} from '@src/web3/core/interfaces';
import lib from '@src/lib';
import { isPhone } from '@src/lib/userAgent';
import client from '@src/client';
import { ModalEnum } from '@src/interfaces/modals';
import { DEFAULT_CHAIN } from '@src/web3/constants';

interface PeerMeta {
    url: string;
    description: string;
    icons: string[];
    name: string;
    ssl: boolean;
}

interface ConnectPayload {
    accounts: AddressString[];
    chainId: 1 | 2 | 3 | 42 | 5;
    peerId: string;
    peerMeta: PeerMeta;
}

export const URI_AVAILABLE = 'URI_AVAILABLE';

function parseChainId(chainId: string | number) {
    return typeof chainId === 'string' ? Number.parseInt(chainId, 10) : chainId;
}

type WalletConnectOptions = Omit<IWCEthRpcConnectionOptions, 'rpc' | 'infuraId'> & {
    rpc: { [chainId: number]: string | string[] };
};

const HREF_PATH = 'wc?uri=';

export class WalletConnect extends Connector {
    /** {@inheritdoc Connector.provider} */
    public provider: WalletConnectCoreProvider['provider'] | undefined = undefined;

    public readonly events = new EventEmitter3();

    private readonly options: Omit<WalletConnectOptions, 'rpc'>;

    private readonly rpc: { [chainId: number]: string[] };

    private __DEV__forceDesktopAction = false;

    private eagerConnection?: Promise<void> | undefined;

    private treatModalCloseAsError: boolean;

    private peer_url_lookup: { [_: string]: Peer };

    declare peers: { [key in Peer]?: PeerInfo__WalletConnect };

    private peer_try?: Peer | undefined;

    /**
     * @param options - Options to pass to `@walletconnect/ethereum-provider`
     * @param connectEagerly - A flag indicating whether connection should be initiated when the class is constructed.
     */
    constructor(
        peers: PeerInfo__WalletConnect[],
        actions: Actions,
        options: WalletConnectOptions,
        connectEagerly = false,
        treatModalCloseAsError = true,
    ) {
        super(ConnectorEnum.WalletConnect, actions, peers);
        this.peer_url_lookup = peers.reduce((prev, curr) => {
            return { ...prev, ...(curr.peerurl && { [curr.peerurl]: curr.peer }) };
        }, {});

        const { rpc, ...rest } = options;
        this.rpc = Object.keys(rpc).reduce<{ [chainId: number]: string[] }>(
            (accumulator, chainId) => {
                const value = rpc[Number(chainId)];
                accumulator[Number(chainId)] = Array.isArray(value) ? value : [value];
                return accumulator;
            },
            {},
        );
        this.options = rest;
        this.treatModalCloseAsError = treatModalCloseAsError;

        if (connectEagerly) void this.connectEagerly();
    }

    private disconnectListener = (error: ProviderRpcError | undefined): void => {
        this.actions.reportError(error);
    };

    private chainChangedListener = (chainId: number | string): void => {
        this.actions.update({ chainId: parseChainId(chainId), peer: this.findPeer() });
    };

    private accountsChangedListener = (accounts: string[]): void => {
        this.actions.update({ accounts, peer: this.findPeer() });
    };

    private connectListener = (_: Error | null, payload: [ConnectPayload]): void => {
        this.actions.update({ ...payload[0], peer: this.findPeer(payload[0]?.peerMeta) });
    };

    private URIListener = (_: Error | null, payload: { params: string[] }): void => {
        const peer = this.peer_try && this.peers[this.peer_try];

        if (peer && peer.deeplink_href) {
            // default - just use normal wallet connect flow
            if (peer.desktopAction === 'default')
                this.events.emit(URI_AVAILABLE, payload.params[0]);

            const uri = `${peer.deeplink_href}${HREF_PATH}${encodeURIComponent(payload.params[0])}`;

            if (!isPhone || this.__DEV__forceDesktopAction) {
                if (peer.desktopAction === 'deeplink') {
                    if (typeof window !== 'undefined') window?.open(uri);
                } else {
                    client.modal.getState().openModal({
                        modalType: ModalEnum.QrCode,
                        info: peer,
                        uri,
                        containerStyle: { background: lib.colors.semiTransparentWhite },
                        backgroundStyle: { background: curriedLighten(0.1)(peer.color) },
                    });
                }
            } else {
                window?.open(uri);
            }
        } else {
            throw new Error('web3:clients:walletconnect:URIListener | peer does not exist');
        }
    };

    private get _signer() {
        return (this.provider as unknown as { signer?: JsonRpcProvider })?.signer;
    }

    private get _signer_connection() {
        return (
            this._signer as unknown as {
                connection?: Merge<
                    SignerConnection,
                    {
                        _transport?: SocketTransport;
                        _nextSocket?: WebSocket;
                        _socket?: WebSocket;
                        wc: Core;
                    }
                >;
            }
        )?.connection;
    }

    private get _signer_connection_transport() {
        return (this._signer_connection as unknown as { wc?: { _transport?: SocketTransport } })?.wc
            ?._transport as
            | Merge<
                  SocketTransport,
                  { _socketClose: () => void; _nextSocket?: WebSocket; _socket?: WebSocket }
              >
            | undefined;
    }

    private get _signer_connection_transport_socket() {
        const a = this._signer_connection_transport;

        return a?._socket || a?._nextSocket;
        // return (this._signer_connection_transport as unknown as { _nextSocket?: WebSocket })
        //     ?._nextSocket;
    }

    private async isomorphicInitialize(
        chainId = Number(Object.keys(this.rpc)[0]),
        peerId = Peer.WalletConnect,
    ): Promise<void> {
        if (this.eagerConnection) return this.eagerConnection;

        const peer = this.peers[peerId];

        // because we can only use 1 url per chainId, we need to decide between multiple, where necessary
        const rpc = Promise.all(
            Object.keys(this.rpc).map(
                async (_chainId): Promise<[number, string]> => [
                    Number(_chainId),
                    await getBestUrl(this.rpc[Number(_chainId)]),
                ],
            ),
        ).then((results) =>
            results.reduce<{ [chainId: number]: string }>((accumulator, [_chainId, url]) => {
                accumulator[_chainId] = url;
                return accumulator;
            }, {}),
        );

        await (this.eagerConnection = import('@walletconnect/ethereum-provider').then(async (m) => {
            // eslint-disable-next-line new-cap
            this.provider = new m.default({
                ...this.options,
                chainId,
                qrcode: peer ? peer.desktopAction === 'default' : false,
                rpc: { ...(await rpc) },
            }) as unknown as WalletConnectCoreProvider['provider'];

            this.provider.connector.on('connect', this.connectListener);
            this.provider.on('disconnect', this.disconnectListener);
            this.provider.on('chainChanged', this.chainChangedListener);
            this.provider.on('accountsChanged', this.accountsChangedListener);
            this.provider.connector.on('display_uri', this.URIListener);

            const c = this._signer_connection_transport_socket;
            const g = this._signer_connection_transport_socket?.onmessage;

            if (c) {
                c.onmessage = function (ev) {
                    console.log('AYOOOOOOOOO');
                    if (g) g.bind(this)(ev);
                    console.log(ev);
                };
            }
            // this._signer_connection_transport_socket?.close();
        }));
        return undefined;
    }

    public refreshPeer(): void {
        const peer = this.findPeerCatchError();

        console.log('refreshing peer found - ', { peer });

        if (peer) return this.actions.update({ peer });
        return undefined;
    }

    private findPeer(peerMeta?: PeerMeta): PeerInfo__WalletConnect {
        if (!peerMeta)
            peerMeta = (
                this.provider as unknown as {
                    signer?: {
                        connection?: {
                            wc?: {
                                _peerMeta: PeerMeta;
                            };
                        };
                    };
                }
            )?.signer?.connection?.wc?._peerMeta;

        console.log({ peerMeta, provider: this.provider });

        const res = peerMeta ? this.peer_url_lookup[peerMeta.url] : undefined;

        if (res === undefined) {
            if (this.peers.walletconnect !== undefined) return this.peers.walletconnect;
            throw new Error(
                'web3:clients:walletconnect:findPeer | walletconnect peer does not exist',
            );
        }

        const finres = this.peers[res];

        if (finres === undefined) throw Error('peer not valid 2');

        return finres;
    }

    private findPeerCatchError(): PeerInfo__WalletConnect | undefined {
        try {
            return this.findPeer();
        } catch {
            return undefined;
        }
    }

    /** {@inheritdoc Connector.connectEagerly} */
    public async connectEagerly(): Promise<void> {
        const cancelActivation = this.actions.startActivation();

        await this.isomorphicInitialize(DEFAULT_CHAIN);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (this.provider!.connected) {
            try {
                // for walletconnect, we always use sequential instead of parallel fetches because otherwise
                // chainId defaults to 1 even if the connecting wallet isn't on mainnet
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const accounts = await this.provider!.request<string[]>({ method: 'eth_accounts' });
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const chainId = parseChainId(
                    await this.provider!.request<string | number>({ method: 'eth_chainId' }),
                );

                if (accounts.length) {
                    this.actions.update({ chainId, accounts, peer: this.findPeer() });
                } else {
                    throw new Error('No accounts returned');
                }
            } catch (error) {
                console.debug('Could not connect eagerly', error);

                void this.deactivate();

                cancelActivation();
            }
        } else {
            void this.deactivate();

            cancelActivation();
        }
    }

    /**
     * Initiates a connection.
     *
     * @param desiredChainId - If defined, indicates the desired chain to connect to. If the user is
     * already connected to this chain, no additional steps will be taken. Otherwise, the user will be prompted to switch
     * to the chain, if their wallet supports it.
     */
    public async activate(
        desiredChainId?: number,
        desiredPeer?: Peer,
        forceDesktopAction = false,
    ): Promise<void> {
        this.peer_try = desiredPeer;
        this.__DEV__forceDesktopAction = forceDesktopAction;

        if (desiredChainId && this.rpc[desiredChainId] === undefined) {
            throw new Error(`no url(s) provided for desiredChainId ${desiredChainId}`);
        }

        // this early return clause catches some common cases if we're already connected
        if (this.provider?.connected) {
            if (!desiredChainId || desiredChainId === this.provider.chainId) return undefined;

            const desiredChainIdHex = `0x${desiredChainId.toString(16)}`;
            return this.provider
                .request<void>({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: desiredChainIdHex }],
                })
                .catch(() => undefined);
            // .then(() => undefined)
            // ;
        }

        this.actions.startActivation();

        // if we're trying to connect to a specific chain that we're not already initialized for, we have to re-initialize
        if (desiredChainId && desiredChainId !== this.provider?.chainId) await this.deactivate();
        else if (desiredPeer && desiredPeer !== this.findPeerCatchError()?.peer)
            await this.deactivate();

        await this.isomorphicInitialize(desiredChainId, desiredPeer);

        try {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const accounts = await this.provider!.request<string[]>({
                method: 'eth_requestAccounts',
            });
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const chainId = parseChainId(
                await this.provider!.request<string | number>({ method: 'eth_chainId' }),
            );

            const peer = this.findPeer();

            if (!desiredChainId || desiredChainId === chainId) {
                return this.actions.update({ chainId, accounts, peer: this.findPeer() });
            }

            if (!desiredPeer || desiredPeer === peer.peer) {
                return this.actions.update({ peer: this.findPeer() });
            }

            // because e.g. metamask doesn't support wallet_switchEthereumChain, we have to report connections,
            // even if the chainId isn't necessarily the desired one. this is ok because in e.g. rainbow,
            // we won't report a connection to the wrong chain while the switch is pending because of the re-initialization
            // logic above, which ensures first-time connections are to the correct chain in the first place
            this.actions.update({ chainId, accounts, peer: this.findPeer() });

            // if we're here, we can try to switch networks, ignoring errors
            const desiredChainIdHex = `0x${desiredChainId.toString(16)}`;
            return await this.provider
                ?.request<void>({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: desiredChainIdHex }],
                })
                .catch(() => undefined);
        } catch (error) {
            // this condition is a bit of a hack :/
            // if a user triggers the walletconnect modal, closes it, and then tries to connect again,
            // the modal will not trigger. the logic below prevents this from happening
            if ((error as Error).message === 'User closed modal') {
                await this.deactivate(this.treatModalCloseAsError ? (error as Error) : undefined);
            } else {
                this.actions.reportError(error as Error);
            }
        }
        return undefined;
    }

    /** {@inheritdoc Connector.deactivate} */
    public async deactivate(error?: Error): Promise<void> {
        this.provider?.off('disconnect', this.disconnectListener);
        this.provider?.off('chainChanged', this.chainChangedListener);
        this.provider?.off('accountsChanged', this.accountsChangedListener);
        (this.provider?.connector as unknown as EventEmitter | undefined)?.off(
            'display_uri',
            this.URIListener,
        );
        (this.provider?.connector as unknown as EventEmitter | undefined)?.off(
            'connect',
            this.connectListener,
        );
        // YO
        const c = this._signer_connection_transport_socket;
        if (c) {
            c.onmessage = () => undefined;
        }
        this._signer_connection_transport_socket?.close();
        this._signer_connection?.wc?.transportClose();
        // await this._signer_connection?.wc?.killSession();
        void this._signer_connection?.close();
        // YO

        await this.provider?.disconnect();

        window?.localStorage.removeItem('walletconnect');
        this.provider = undefined;
        this.eagerConnection = undefined;
        this.actions.reportError(error);
    }
}
