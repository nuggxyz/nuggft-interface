import { EmitEventNames, EmitWorkerEventBase } from '@src/emitter/interfaces';

import emitter from '..';

export const worker: Worker = new Worker(new URL('./rpc.worker.ts', import.meta.url));

worker.onmessage = ({ data }: { data: EmitWorkerEventBase }) => {
    // console.log('[APP] ', data);
    emitter.emit(data);
};

setInterval(() => {
    emitter.emit({ type: EmitEventNames.HealthCheck });
    worker.postMessage({ type: EmitEventNames.HealthCheck });
}, 1000);

console.log('[App] MyWorker instance:', worker);
