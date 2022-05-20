import { Log } from '@ethersproject/abstract-provider';

import { InterfacedEvent } from '@src/interfaces/events';
import { InfuraWebSocketProvider } from '@src/web3/classes/CustomWebSocketProvider';
import emitter from '@src/emitter';
import { DEFAULT_CONTRACTS } from '@src/web3/constants';
import { NuggftV1__factory } from '@src/typechain';
import { EmitEventsListPayload } from '@src/emitter/interfaces';

// @ts-ignore
const ctx: Worker & { emitMessage: (arg: EmitEventsListPayload) => void } =
    // eslint-disable-next-line no-restricted-globals
    self as DedicatedWorkerGlobalScope;

console.log(ctx);

ctx.emitMessage = (data: unknown) => ctx.postMessage.call(ctx, data);

export default {} as typeof Worker & { new (): Worker };

const inter = NuggftV1__factory.createInterface();

console.log('[MyWorker] Running.');

const socket = new InfuraWebSocketProvider();

const blockListener = (log: number) => {
    console.log('block ', log);
    ctx.emitMessage({
        type: emitter.events.IncomingRpcBlock,
        data: log,
        log,
    });
};

const eventListener = (log: Log) => {
    const event = inter.parseLog(log) as unknown as InterfacedEvent;

    console.log({ event });

    ctx.emitMessage({
        type: emitter.events.IncomingRpcEvent,
        data: event,
        log,
    });
};

void socket.getBlockNumber().then(blockListener);

socket.on(
    {
        address: DEFAULT_CONTRACTS.NuggftV1,
        topics: [],
    },
    eventListener,
);

socket.on('block', blockListener);
