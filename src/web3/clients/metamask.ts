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
    MetaMaskCoreProvider,
} from '@src/web3/core/types';
import { PeerInfo__MetaMask, Connector as ConnectorEnum } from '@src/web3/core/interfaces';
import { DEFAULT_CHAIN } from '@src/web3/constants';

export class NoMetaMaskError extends Error {
    public constructor() {
        super('MetaMask not installed');
        this.name = NoMetaMaskError.name;
        Object.setPrototypeOf(this, NoMetaMaskError.prototype);
    }
}

const store = create(
    persist(
        combine(
            {
                hasDisconnected: false,
            },
            (set) => {
                const disconnect = () => {
                    set(() => {
                        return {
                            hasDisconnected: true,
                        };
                    });
                };

                const connect = () => {
                    set(() => {
                        return {
                            hasDisconnected: false,
                        };
                    });
                };

                return { disconnect, connect };
            },
        ),
        { name: 'nugg.xyz-metamask-disconnect', version: 0 },
    ),
);

function parseChainId(chainId: string) {
    return Number.parseInt(chainId, 16);
}

export class MetaMask extends Connector {
    private readonly options?: Parameters<typeof detectEthereumProvider>[0];

    private eagerConnection?: Promise<void>;

    public provider: MetaMaskCoreProvider['provider'] | undefined;

    /**
     * @param connectEagerly - A flag indicating whether connection should be initiated when the class is constructed.
     * @param options - Options to pass to `@metamask/detect-provider`
     */
    constructor(
        peer: PeerInfo__MetaMask,
        actions: Actions,
        options?: Parameters<typeof detectEthereumProvider>[0],
        connectEagerly = false,
    ) {
        super(ConnectorEnum.MetaMask, actions, [peer]);

        // if (connectEagerly && typeof window === 'undefined') {
        //     throw new Error(
        //         'connectEagerly = true is invalid for SSR, instead use the connectEagerly method in a useEffect',
        //     );
        // }

        this.options = options;

        if (connectEagerly) void this.connectEagerly();
    }

    private async isomorphicInitialize(): Promise<void> {
        if (this.eagerConnection) return this.eagerConnection;

        await (this.eagerConnection = import('@metamask/detect-provider/dist')
            .then((m) => m.default(this.options))
            .then((provider) => {
                if (provider) {
                    this.provider = provider as MetaMaskCoreProvider['provider'];

                    this.provider.on('connect', ({ chainId }: ProviderConnectInfo): void => {
                        this.actions.update({
                            chainId: parseChainId(chainId),
                            peer: this.peers.metamask,
                        });
                        store.getState().connect();
                    });

                    this.provider.on('disconnect', (error: ProviderRpcError): void => {
                        this.actions.reportError(error);
                        store.getState().disconnect();
                    });

                    this.provider.on('chainChanged', (chainId: string): void => {
                        this.actions.update({
                            chainId: parseChainId(chainId),
                            peer: this.peers.metamask,
                        });
                    });

                    this.provider.on('accountsChanged', (accounts: string[]): void => {
                        if (accounts.length === 0) {
                            // handle this edge case by disconnecting
                            this.actions.reportError(undefined);
                        } else {
                            this.actions.update({ accounts, peer: this.peers.metamask });
                        }
                    });
                }
            }));
        return undefined;
    }

    /** {@inheritdoc Connector.connectEagerly} */
    public async connectEagerly(): Promise<void> {
        if (store.getState().hasDisconnected) return undefined;

        const cancelActivation = this.actions.startActivation();

        await this.isomorphicInitialize();
        if (!this.provider) return cancelActivation();

        store.getState().connect();

        return Promise.all([
            this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
            this.provider.request({ method: 'eth_accounts' }) as Promise<string[]>,
        ])
            .then(([chainId, accounts]) => {
                const receivedChainId = parseChainId(chainId);
                const desiredChainId = DEFAULT_CHAIN;

                // if there's no desired chain, or it's equal to the received, update
                if (!desiredChainId || receivedChainId === desiredChainId)
                    return this.actions.update({
                        chainId: receivedChainId,
                        accounts,
                    });

                const desiredChainIdHex = `0x${desiredChainId.toString(16)}`;

                // if we're here, we can try to switch networks
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                return this.provider!.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: desiredChainIdHex }],
                })
                    .catch((error: ProviderRpcError) => {
                        throw error;
                    })
                    .then(() => this.activate(desiredChainId));
            })
            .catch((error) => {
                console.debug('Could not connect eagerly', error);
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
    ): Promise<void> {
        if (store.getState().hasDisconnected) {
            store.getState().connect();
            await this.connectEagerly();
            if (this.provider) return undefined;
        }

        this.actions.startActivation();

        await this.isomorphicInitialize();
        if (!this.provider) return this.actions.reportError(new NoMetaMaskError());

        return Promise.all([
            this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
            this.provider.request({ method: 'eth_requestAccounts' }) as Promise<string[]>,
        ])
            .then(([chainId, accounts]) => {
                const receivedChainId = parseChainId(chainId);
                const desiredChainId =
                    typeof desiredChainIdOrChainParameters === 'number'
                        ? desiredChainIdOrChainParameters
                        : desiredChainIdOrChainParameters?.chainId;

                // if there's no desired chain, or it's equal to the received, update
                if (!desiredChainId || receivedChainId === desiredChainId)
                    return this.actions.update({
                        chainId: receivedChainId,
                        accounts,
                    });

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

        // void window.ethereum!.request!({ method: 'eth_disconnect' });
    }
}
