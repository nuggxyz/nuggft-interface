import { InfuraWebSocketProvider } from '@src/web3/classes/CustomWebSocketProvider';

// @ts-ignore
// eslint-disable-next-line no-restricted-globals
const ctx: Worker = self as DedicatedWorkerGlobalScope;

export default {} as typeof Worker & { new (): Worker };

console.log('[MyWorker] Running.');

const socket = new InfuraWebSocketProvider();

socket.on('block', (number: number) => {
    console.log(`IM HERE ${number}`);
    ctx.postMessage(`block time baybeeeee ${number}`);
});

ctx.addEventListener('message', (event: MessageEvent): void => {
    console.log('[MyWorker] Incoming message from main thread:', event.data);
});
