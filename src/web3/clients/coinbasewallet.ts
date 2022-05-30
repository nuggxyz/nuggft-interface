import type { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { CoinbaseWalletProvider } from '@coinbase/wallet-sdk';
import create from 'zustand';
import { combine, persist } from 'zustand/middleware';
import { WalletSDKRelayAbstract } from '@coinbase/wallet-sdk/dist/relay/WalletSDKRelayAbstract';
import { WalletSDKConnection } from '@coinbase/wallet-sdk/dist/connection/WalletSDKConnection';

import {
    Actions,
    AddEthereumChainParameter,
    ProviderConnectInfo,
    ProviderRpcError,
    Connector,
} from '@src/web3/core/types';
import { PeerInfo__CoinbaseWallet, Connector as ConnectorEnum } from '@src/web3/core/interfaces';

function parseChainId(chainId: string | number) {
    return typeof chainId === 'number'
        ? chainId
        : Number.parseInt(chainId, chainId.startsWith('0x') ? 16 : 10);
}

type CoinbaseWalletSDKOptions = ConstructorParameters<typeof CoinbaseWalletSDK>[0] & {
    url: string;
};

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
        { name: 'nugg.xyz-coinbase-wallet-disconnect', version: 0 },
    ),
);

export class CoinbaseWallet extends Connector {
    /** {@inheritdoc Connector.provider} */
    public provider: CoinbaseWalletProvider | undefined;

    private readonly options: CoinbaseWalletSDKOptions;

    private eagerConnection?: Promise<void>;

    /**
     * A `CoinbaseWalletSDK` instance.
     */
    public coinbaseWallet: CoinbaseWalletSDK | undefined;

    /**
     * @param options - Options to pass to `@coinbase/wallet-sdk`
     * @param connectEagerly - A flag indicating whether connection should be initiated when the class is constructed.
     */
    constructor(
        peer: PeerInfo__CoinbaseWallet,
        actions: Actions,
        options: CoinbaseWalletSDKOptions,
        connectEagerly = false,
    ) {
        super(ConnectorEnum.CoinbaseWallet, actions, [peer]);
        this.options = options;

        if (connectEagerly) void this.connectEagerly();
    }

    // the `connected` property, is bugged, but this works as a hack to check connection status
    private get connected() {
        return !!this.provider?.selectedAddress;
    }

    private get _relay() {
        return (this.coinbaseWallet as unknown as { _relay?: WalletSDKRelayAbstract })?._relay;
    }

    private get _relay_connection() {
        return (this._relay as unknown as { connection: WalletSDKConnection }).connection;
    }

    private async isomorphicInitialize(): Promise<void> {
        if (this.eagerConnection) return this.eagerConnection;

        await (this.eagerConnection = import('@coinbase/wallet-sdk').then((m) => {
            const { url, ...options } = this.options;
            this.coinbaseWallet = new m.default(options);

            this.provider = this.coinbaseWallet.makeWeb3Provider(url);

            this.provider.on('connect', ({ chainId }: ProviderConnectInfo): void => {
                store.getState().connect();

                this.actions.update({ chainId: parseChainId(chainId), peer: this.peers.coinbase });
            });

            this.provider.on('disconnect', (error: ProviderRpcError): void => {
                this.actions.reportError(error);
                store.getState().disconnect();
            });

            this.provider.on('chainChanged', (chainId: string): void => {
                this.actions.update({ chainId: parseChainId(chainId) });
            });

            this.provider.on('accountsChanged', (accounts: string[]): void => {
                this.actions.update({ accounts });
            });
        }));

        return undefined;
    }

    /** {@inheritdoc Connector.connectEagerly} */
    public async connectEagerly(): Promise<void> {
        if (store.getState().hasDisconnected) return undefined;

        if (
            window.localStorage.getItem('-walletlink:https://www.walletlink.org:version') === null
        ) {
            return undefined;
        }

        const cancelActivation = this.actions.startActivation();

        await this.isomorphicInitialize();

        if (this.connected) {
            store.getState().connect();

            // this._relay_connection.connect();

            return Promise.all([
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.provider!.request<string>({ method: 'eth_chainId' }),
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.provider!.request<string[]>({ method: 'eth_accounts' }),
            ])
                .then(([chainId, accounts]) => {
                    if (accounts.length) {
                        this.actions.update({
                            chainId: parseChainId(chainId),
                            accounts,
                            peer: this.peers.coinbase,
                        });
                    } else {
                        throw new Error('No accounts returned');
                    }
                })
                .catch((error) => {
                    console.debug('Could not connect eagerly', error);
                    cancelActivation();
                });
        }

        // manually destroy relay connection, killing unnessesary websocket (without page reload)
        this._relay_connection?.destroy();

        // destroy the eager connection so we can retry later
        delete this.eagerConnection;

        cancelActivation();

        return undefined;
    }

    /**
     * Initiates a connection.
     *
     * @param desiredChainIdOrChainParameters - If defined, indicates the desired chain to connect to. If the user is
     * already connected to this chain, no additional steps will be taken. Otherwise, the user will be prompted to switch
     * to the chain, if one of two conditions is met: either they already have it added, or the argument is of type
     * AddEthereumChainParameter, in which case the user will be prompted to add the chain with the specified parameters
     * first, before being prompted to switch.
     */
    public async activate(
        desiredChainIdOrChainParameters?: number | AddEthereumChainParameter,
    ): Promise<void> {
        if (store.getState().hasDisconnected) {
            store.getState().connect();
            await this.connectEagerly();
            if (this.connected) return undefined;
        }

        const desiredChainId =
            typeof desiredChainIdOrChainParameters === 'number'
                ? desiredChainIdOrChainParameters
                : desiredChainIdOrChainParameters?.chainId;

        if (this.connected) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            if (!desiredChainId || desiredChainId === parseChainId(this.provider!.chainId))
                return undefined;

            const desiredChainIdHex = `0x${desiredChainId.toString(16)}`;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return this.provider!.request<void>({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: desiredChainIdHex }],
            })
                .catch(async (error: ProviderRpcError) => {
                    if (
                        error.code === 4902 &&
                        typeof desiredChainIdOrChainParameters !== 'number'
                    ) {
                        // if we're here, we can try to add a new network
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        return this.provider!.request<void>({
                            method: 'wallet_addEthereumChain',
                            params: [
                                { ...desiredChainIdOrChainParameters, chainId: desiredChainIdHex },
                            ],
                        });
                    }
                    throw error;
                })
                .catch((error: ProviderRpcError) => {
                    this.actions.reportError(error);
                });
        }

        this.actions.startActivation();
        await this.isomorphicInitialize();

        return Promise.all([
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.provider!.request<string>({ method: 'eth_chainId' }),
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.provider!.request<string[]>({ method: 'eth_requestAccounts' }),
        ])
            .then(([chainId, accounts]) => {
                const receivedChainId = parseChainId(chainId);

                if (!desiredChainId || desiredChainId === receivedChainId) {
                    return this.actions.update({ chainId: receivedChainId, accounts });
                }

                // if we're here, we can try to switch networks
                const desiredChainIdHex = `0x${desiredChainId.toString(16)}`;
                return this.provider
                    ?.request<void>({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: desiredChainIdHex }],
                    })
                    .catch(async (error: ProviderRpcError) => {
                        if (
                            error.code === 4902 &&
                            typeof desiredChainIdOrChainParameters !== 'number'
                        ) {
                            // if we're here, we can try to add a new network
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            return this.provider!.request<void>({
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
                    });
            })
            .catch((error: Error) => {
                this.actions.reportError(error);
            });
    }

    /** {@inheritdoc Connector.deactivate} */
    public deactivate(): void {
        window?.localStorage.removeItem('-walletlink:https://www.walletlink.org:session:id');
        window?.localStorage.removeItem('-walletlink:https://www.walletlink.org:session:linked');
        window?.localStorage.removeItem('-walletlink:https://www.walletlink.org:session:secret');
        window?.localStorage.removeItem('-walletlink:https://www.walletlink.org:session:version');

        this.coinbaseWallet?.disconnect();
    }
}
