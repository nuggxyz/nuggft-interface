/* eslint-disable max-classes-per-file */

import type detectEthereumProvider from '@metamask/detect-provider/dist';
import create from 'zustand';
import { combine, persist } from 'zustand/middleware';

import {
    Connector,
    ProviderConnectInfo,
    ProviderRpcError,
    AddEthereumChainParameter,
    Actions,
    InjectedCoreProvider,
} from '@src/web3/core/types';
import { PeerInfo__Injected, Connector as ConnectorEnum, Peer } from '@src/web3/core/interfaces';

export class NoInjectedError extends Error {
    public constructor() {
        super('Injected not installed');
        this.name = NoInjectedError.name;
        Object.setPrototypeOf(this, NoInjectedError.prototype);
    }
}

const store = create(
    persist(
        combine(
            {
                last: null as Peer | null,
                hasDisconnected: false,
            },
            (set) => {
                const disconnect = () => {
                    set(() => {
                        return {
                            last: null,
                            hasDisconnected: true,
                        };
                    });
                };

                const connect = (peer: Peer | null = null) => {
                    set(() => {
                        return {
                            last: peer,
                            hasDisconnected: false,
                        };
                    });
                };

                return { disconnect, connect };
            },
        ),
        { name: 'nugg.xyz-injected-helper', version: 0 },
    ),
);

function parseChainId(chainId: string) {
    return Number.parseInt(chainId, 16);
}

const peerCheck = (provider?: InjectedCoreProvider['provider']) => {
    if (provider) {
        const check = provider as unknown as {
            isBraveWallet?: boolean;
            isMetaMask?: boolean;
            isCoinbaseWallet?: boolean;
            isCoinbaseBrowser?: boolean;
        };
        if (check.isBraveWallet) {
            return Peer.Brave;
        }
        if (check.isCoinbaseBrowser || check.isCoinbaseWallet) {
            return Peer.CoinbaseWallet;
        }
        if (check.isMetaMask) {
            return Peer.MetaMask;
        }
    }
    return Peer.GenericInjected;
};

export class Injected extends Connector {
    private readonly options?: Parameters<typeof detectEthereumProvider>[0];

    private eagerConnection?: Promise<void>;

    public provider: InjectedCoreProvider['provider'] | undefined;

    private peerCheck() {
        return this.peers[peerCheck(this.provider)];
    }

    /**
     * @param connectEagerly - A flag indicating whether connection should be initiated when the class is constructed.
     * @param options - Options to pass to `@metamask/detect-provider`
     */
    constructor(
        peers: PeerInfo__Injected[],
        actions: Actions,
        options: Parameters<typeof detectEthereumProvider>[0] = { mustBeMetaMask: false },
        connectEagerly = false,
    ) {
        super(ConnectorEnum.Injected, actions, peers);

        this.options = options;

        if (connectEagerly && this.connectEagerly) void this.connectEagerly();
    }

    declare peers: {
        [Peer.CoinbaseWallet]: PeerInfo__Injected;
        [Peer.GenericInjected]: PeerInfo__Injected;
        [Peer.MetaMask]: PeerInfo__Injected;
        [Peer.Brave]: PeerInfo__Injected;
    };

    private peer_try?: Peer | undefined;

    private async isomorphicInitialize(): Promise<void> {
        if (this.eagerConnection) return this.eagerConnection;

        await (this.eagerConnection = import('@metamask/detect-provider/dist')
            .then((m) => m.default(this.options))
            .then((provider) => {
                if (provider) {
                    this.provider = provider as InjectedCoreProvider['provider'];

                    const prov = provider as {
                        selectedProvider: null | InjectedCoreProvider['provider'];
                        providers:
                            | null
                            | (InjectedCoreProvider['provider'] &
                                  NonNullable<typeof window['ethereum']>['providers'])[];
                    };

                    const prev = this.peer_try ?? store.getState().last;

                    if (
                        prov.selectedProvider &&
                        (!prev || prev === peerCheck(prov.selectedProvider))
                    ) {
                        this.provider = prov.selectedProvider;
                    } else if (prev && prov.providers && prov.providers.length > 0) {
                        for (let i = 0; i < prov.providers.length; i++) {
                            if (prov.providers[i]) {
                                if (peerCheck(prov.providers[i]) !== prev) {
                                    // eslint-disable-next-line no-continue
                                    continue;
                                }

                                this.provider = prov.providers[i];
                                break;
                            }
                        }
                    }

                    console.log('after', this.provider);

                    this.provider.on('connect', ({ chainId }: ProviderConnectInfo): void => {
                        this.actions.update({
                            chainId: parseChainId(chainId),
                            peer: this.peerCheck(),
                        });
                        store.getState().connect(this.peerCheck().peer);
                    });

                    this.provider.on('disconnect', (error: ProviderRpcError): void => {
                        this.actions.reportError(error);
                        store.getState().disconnect();
                    });

                    this.provider.on('chainChanged', (chainId: string): void => {
                        this.actions.update({
                            chainId: parseChainId(chainId),
                            peer: this.peerCheck(),
                        });
                    });

                    this.provider.on('accountsChanged', (accounts: `0x${string}`[]): void => {
                        if (accounts.length === 0) {
                            // handle this edge case by disconnecting
                            this.actions.reportError(undefined);
                        } else {
                            this.actions.update({
                                accounts: accounts.toLowerCase(),
                                peer: this.peerCheck(),
                            });
                        }
                    });
                }
            }));
        return undefined;
    }

    // private findPeer(peerMeta?: PeerMeta): PeerInfo__WalletConnect {
    //     if (!peerMeta) this.provider.isC;

    //     console.log({ peerMeta, provider: this.provider });

    //     const res = peerMeta ? this.peer_url_lookup[peerMeta.url] : undefined;

    //     if (res === undefined) {
    //         if (this.peers.walletconnect !== undefined) return this.peers.walletconnect;
    //         throw new Error(
    //             'web3:clients:walletconnect:findPeer | walletconnect peer does not exist',
    //         );
    //     }

    //     const finres = this.peers[res];

    //     if (finres === undefined) throw Error('peer not valid 2');

    //     return finres;
    // }

    /** {@inheritdoc Connector.connectEagerly} */
    public async connectEagerly(): Promise<void> {
        if (store.getState().hasDisconnected) return undefined;

        const cancelActivation = this.actions.startActivation();

        await this.isomorphicInitialize();
        if (!this.provider) return cancelActivation();

        // store.getState().connect();

        return Promise.all([
            this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
            this.provider.request({ method: 'eth_accounts' }) as Promise<`0x${string}`[]>,
        ])
            .then(([chainId, accounts]) => {
                if (accounts.length) {
                    store.getState().connect(this.peerCheck().peer);
                    this.actions.update({
                        chainId: parseChainId(chainId),
                        accounts: accounts.toLowerCase(),
                        peer: this.peerCheck(),
                    });
                } else {
                    throw new Error('No accounts returned');
                }
            })
            .catch((error) => {
                console.debug('Could not connect eagerly', error);
                this.provider = undefined;
                cancelActivation();
            });
    }

    /**
     * Initiates a connection.
     *
     * @param desiredChainIdOrChainParameters - If defined, indicates the desired chain to connect to. If the user is
     * already connected to this chain, no additional steps will be taken. Otherwise, the user will be prompted to switch
     * to the chain, if one of two conditions is met: either they already have it added in their extension, or the
     * argument is of type AddEthereumChainParameter, in which case the user will be prompted to add the chain with the
     * specified parameters first, before being prompted to switch.
     */
    public async activate(
        desiredChainIdOrChainParameters?: number | AddEthereumChainParameter,
        desiredPeer?: Peer,
    ): Promise<void> {
        console.log(desiredChainIdOrChainParameters, desiredPeer);
        this.peer_try = desiredPeer;

        if (store.getState().hasDisconnected) {
            store.getState().connect(desiredPeer || null);
            delete this.eagerConnection;
            await this.connectEagerly();

            console.log(this.provider);
            if (this.provider) return undefined;
        }

        delete this.eagerConnection;

        this.actions.startActivation();
        await this.isomorphicInitialize();
        if (!this.provider) return this.actions.reportError(new NoInjectedError());
        console.log('ayyyooooo', this.provider);

        return Promise.all([
            this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
            this.provider.request({ method: 'eth_requestAccounts' }) as Promise<`0x${string}`[]>,
        ])
            .then(([chainId, accounts]) => {
                const receivedChainId = parseChainId(chainId);
                const desiredChainId =
                    typeof desiredChainIdOrChainParameters === 'number'
                        ? desiredChainIdOrChainParameters
                        : desiredChainIdOrChainParameters?.chainId;

                // if there's no desired chain, or it's equal to the received, update
                if (!desiredChainId || receivedChainId === desiredChainId) {
                    store.getState().connect(this.peerCheck().peer);

                    return this.actions.update({
                        chainId: receivedChainId,
                        accounts: accounts.toLowerCase(),
                        peer: this.peerCheck(),
                    });
                }

                const desiredChainIdHex = `0x${desiredChainId.toString(16)}`;

                // if we're here, we can try to switch networks
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                return this.provider!.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: desiredChainIdHex }],
                })
                    .catch((error: ProviderRpcError) => {
                        if (
                            error.code === 4902 &&
                            typeof desiredChainIdOrChainParameters !== 'number'
                        ) {
                            // if we're here, we can try to add a new network
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            return this.provider!.request({
                                method: 'wallet_addEthereumChain',
                                params: [
                                    {
                                        ...desiredChainIdOrChainParameters,
                                        chainId: desiredChainIdHex,
                                    },
                                ],
                            });
                        }
                        throw error;
                    })
                    .then(() => this.activate(desiredChainId));
            })
            .catch((error: ProviderRpcError) => {
                this.actions.reportError(error);
            });
    }

    public deactivate(): void | Promise<void> {
        void super.deactivate([]);
        store.getState().disconnect();

        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this.provider?.close();

        // void window.ethereum!.request!({ method: 'eth_disconnect' });
    }
}
