import { Log } from '@ethersproject/abstract-provider';

import { InterfacedEvent } from '@src/interfaces/events';
import { InfuraWebSocketProvider } from '@src/web3/classes/CustomWebSocketProvider';
import emitter from '@src/emitter';
import { DEFAULT_CONTRACTS } from '@src/web3/constants';
import { NuggftV1__factory } from '@src/typechain';
import { EmitEventsListPayload } from '@src/emitter/interfaces';

// @ts-ignore
const ctx: Worker & {
    emitMessage: (arg: EmitEventsListPayload) => void;
    // close: () => void;
    // isRunning: boolean;
    // _selfClose: () => void;
} =
    // eslint-disable-next-line no-restricted-globals
    self as DedicatedWorkerGlobalScope;

ctx.emitMessage = (data: unknown) => ctx.postMessage.call(ctx, data);

// ctx._selfClose = ctx.close;

export default {} as typeof Worker & { new (): Worker };

const inter = NuggftV1__factory.createInterface();

console.log('[MyWorker] Running.');

let socket: InfuraWebSocketProvider;

const blockListener = (log: number) => {
    console.log('block ', log);
    ctx.emitMessage({
        type: emitter.events.IncomingRpcBlock,
        data: log,
        log,
    });
};

// ctx.isRunning = true;

// ctx.close = function () {
//     // Mark it as no longer running
//     ctx.isRunning = false;

//     // Call original close function
//     this._selfClose();
// };

const eventListener = (log: Log) => {
    const event = inter.parseLog(log) as unknown as InterfacedEvent;

    console.log({ event });

    ctx.emitMessage({
        type: emitter.events.IncomingRpcEvent,
        data: event,
        log,
    });
};

const buildSocket = () => {
    if (socket) void socket.destroy();

    console.log('BUILDSOCKET');

    socket = new InfuraWebSocketProvider();
    void socket.getBlockNumber().then(blockListener);
    socket.on(
        {
            address: DEFAULT_CONTRACTS.NuggftV1,
            topics: [],
        },
        eventListener,
    );
    socket.on('block', blockListener);
};

buildSocket();

ctx.addEventListener('message', ({ data }: MessageEvent<EmitEventsListPayload>) => {
    // if (data.type === emitter.events.IncomingRpcBlock) {
    //     console.log('a');
    // }

    if (data.type === emitter.events.HealthCheck) {
        // if (ctx.isRunning) {
        ctx.emitMessage({ type: emitter.events.WorkerIsRunning, label: 'rpc' });
        // }

        if (!socket._websocket.OPEN) {
            buildSocket();
        }
    }
});
