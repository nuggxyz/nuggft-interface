import type { Log } from '@ethersproject/abstract-provider';

import { InterfacedEvent } from '@src/interfaces/events';
import { InfuraWebSocketProvider } from '@src/web3/classes/CustomWebSocketProvider';
import emitter from '@src/emitter';
import { Chain, DEFAULT_CONTRACTS } from '@src/web3/constants';
import { EmitEventsListPayload } from '@src/emitter/interfaces';
import { CustomEtherscanProvider } from '@src/web3/classes/CustomEtherscanProvider';
import { NuggftV1__factory } from '@src/typechain/factories/NuggftV1__factory';

// @ts-ignore
const ctx: Worker & {
    emitMessage: (arg: EmitEventsListPayload) => void;
} =
    // eslint-disable-next-line no-restricted-globals
    self as DedicatedWorkerGlobalScope;

ctx.emitMessage = (data: unknown) => ctx.postMessage.call(ctx, data);

export default {} as typeof Worker & { new (): Worker };

console.log('[rpc.worker] Worker running');

// let socket: InfuraWebSocketProvider;
//
const etherscan = new CustomEtherscanProvider(Chain.MAINNET);

// let lastBlockTime: number = new Date().getTime();
let lastBlock = 0;

const blockListener = (log: number) => {
    if (lastBlock !== log) {
        console.log('block ', log);

        lastBlock = log;

        // lastBlockTime = new Date().getTime();

        ctx.emitMessage({
            type: emitter.events.IncomingRpcBlock,
            data: log,
            log,
        });

        void etherscan
            .getCustomEtherPrice()
            .then((price) => {
                ctx.emitMessage({
                    type: emitter.events.IncomingEtherscanPrice,
                    data: price,
                });
            })
            .catch(() => {
                ctx.emitMessage({
                    type: emitter.events.IncomingEtherscanPrice,
                    data: null,
                });
            });
    }
};
const inter = NuggftV1__factory.createInterface();
const eventListener = (log: Log) => {
    const event = inter.parseLog(log) as unknown as InterfacedEvent;

    ctx.emitMessage({
        type: emitter.events.IncomingRpcEvent,
        data: event,
        log,
    });
};

// let lastBuild = 0;

// const buildSocket = () => {
//     if (socket && new Date().getTime() - lastBuild < 30000) {
//         return;
//     }

//     lastBuild = new Date().getTime();

//     if (socket) void socket.destroy();

//     console.log('BUILDSOCKET');

//     socket = new InfuraWebSocketProvider();
//     void socket.getBlockNumber().then(blockListener);
//     socket.on(
//         {
//             address: DEFAULT_CONTRACTS.NuggftV1,
//             topics: [],
//         },
//         eventListener,
//     );
//     socket.on('block', blockListener);
// };

const buildRpcWebsocket = () => {
    const _rpc = new InfuraWebSocketProvider();

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

buildRpcWebsocket();

setInterval(() => {
    ctx.emitMessage({
        type: emitter.events.WorkerIsRunning,
        label: 'rpc',
    });
    // if (
    //     socket._websocket.readyState === socket._websocket.CLOSED ||
    //     new Date().getTime() - lastBlockTime > 30000
    // ) {
    //     buildSocket();
    // }
}, 4000);

// ctx.addEventListener('message', ({ data }: MessageEvent<EmitEventsListPayload>) => {
//     if (data.type === emitter.events.HealthCheck) {
//         ctx.emitMessage({ type: emitter.events.WorkerIsRunning, label: 'rpc' });

//         // console.log();

//         if (
//             socket._websocket.readyState === socket._websocket.CLOSED ||
//             new Date().getTime() - lastBlockTime > 30000
//         ) {
//             buildSocket();
//         }
//     }
// });

// setTimeout(() => {
//     socket._websocket.close();
// }, 3000);
