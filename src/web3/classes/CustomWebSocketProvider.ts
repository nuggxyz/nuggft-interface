/* eslint-disable max-classes-per-file */
import { AlchemyProvider, EventType, InfuraProvider, Networkish } from '@ethersproject/providers';
import { logger } from 'ethers';
import { defineReadOnly, Logger } from 'ethers/lib/utils';
import { Event } from '@ethersproject/providers/lib/base-provider';

import { DEFAULT_CHAIN, INFURA_KEY } from '@src/web3/constants';

import { EthersWebSocketProvider, getEventTag } from './EthersWebSocketProvider';

export class CustomWebSocketProvider extends EthersWebSocketProvider {
    private _destroy;

    constructor(url: string, network: Networkish, onClose: (e: CloseEvent) => void) {
        super(url, network);

        this._destroy = super.destroy.bind(this);
        this._websocket.onclose = onClose;
    }

    public override destroy() {
        this._websocket.onclose = () => {};
        return this._destroy();
    }

    updateListener(ev: EventType, listener: (...args: any) => void) {
        const checkTag = getEventTag(ev);
        this._events.forEach((x, i) => {
            if (checkTag === x.tag) {
                this._events[i] = new Event(x.tag, listener, x.once);
            }
        });
    }
}

export class InfuraWebSocketProvider extends CustomWebSocketProvider {
    readonly apiKey!: string;

    readonly projectId!: string;

    readonly projectSecret!: string;

    constructor(
        network: Networkish = DEFAULT_CHAIN,
        apiKey: string = INFURA_KEY,
        onClose: (e: CloseEvent) => void = () => undefined,
    ) {
        const provider = new InfuraProvider(network, apiKey);
        const { connection } = provider;
        if (connection.password) {
            logger.throwError(
                'INFURA WebSocket project secrets unsupported',
                Logger.errors.UNSUPPORTED_OPERATION,
                {
                    operation: 'InfuraProvider.getWebSocketProvider()',
                },
            );
        }

        const url = connection.url.replace(/^http/i, 'ws').replace('/v3/', '/ws/v3/');
        super(url, network, onClose);

        defineReadOnly(this, 'apiKey', provider.projectId);
        defineReadOnly(this, 'projectId', provider.projectId);
        defineReadOnly(this, 'projectSecret', provider.projectSecret);
    }
}

export class AlchemyWebSocketProvider extends CustomWebSocketProvider {
    readonly apiKey!: string;

    constructor(network: Networkish, apiKey: string, onClose: (e: CloseEvent) => void) {
        const provider = new AlchemyProvider(network, apiKey);

        const url = provider.connection.url
            .replace(/^http/i, 'ws')
            .replace('.alchemyapi.', '.ws.alchemyapi.');

        super(url, provider.network, onClose);
        defineReadOnly(this, 'apiKey', provider.apiKey as string);
    }
}

// class RestartingWebsocket extends InfuraWebSocketProvider {
//     // public static _instance: InfuraWebSocketProvider;

//     public _websocket: WebSocket | undefined = undefined;

//     constructor(net: string, key: string) {
//         super(net, key);
//         this.listenChanges();
//         this._destroy = super.destroy.bind(this);

//         setInterval(() => {
//             this._websocket.close();
//         }, 2000);

//         const mthis = this as Mutable<RestartingWebsocket>;
//         mthis._websocket.
//         mthis._websocket = super._websocket as WebSocket;
//     }

//     private _destroy: typeof this.destroy;

//     private timer: NodeJS.Timer | undefined = undefined;

//     private killed = false;

//     public override destroy(): Promise<void> {
//         this.killed = true;
//         return this._destroy();
//     }

//     private listenChanges(): void {
//         if (this.killed) return;

//         const mthis = this as Mutable<RestartingWebsocket>;

//         mthis._websocket = new WebSocket(this._websocket.url);

//         // rpc = new InfuraWebSocketProvider(CHAIN_INFO[chainId].label, INFURA_KEY);
//         // eslint-disable-next-line @typescript-eslint/unbound-method

//         this._websocket.onerror = (err): void => {
//             console.error('Socket encountered error: ', err, 'Closing socket');
//             this._websocket.close();
//         };

//         const before = this._websocket.onopen as (this: WebSocket, ev: Event) => any;

//         this._websocket.onopen = (ev) => {
//             if (this.timer) clearInterval(this.timer);
//             before.call(this._websocket, ev);
//         };

//         this._websocket.onclose = (e): void => {
//             console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
//             setTimeout(() => {
//                 this.listenChanges();
//             }, 1000);

//             this.timer = setInterval(() => {
//                 this.listenChanges();
//             }, 10000);
//         };
//     }
// }
