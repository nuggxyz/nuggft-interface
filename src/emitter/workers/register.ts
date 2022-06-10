import ReactGA from 'react-ga4';

import { EmitEventNames, EmitWorkerEventBase } from '@src/emitter/interfaces';

import emitter from '..';

let worker: Worker & { isRunning?: boolean };

let workerCount = 0;

let lastWorkerResponse = new Date().getTime();

const buildWorker = () => {
    if (worker) worker.terminate();

    worker = new Worker(new URL('./rpc.worker.ts', import.meta.url));

    console.log(`[App:buildWorker] Worker instance ${workerCount++}:`);

    worker.onmessage = ({ data }: { data: EmitWorkerEventBase }) => {
        lastWorkerResponse = new Date().getTime();

        emitter.emit(data.type, data);
    };

    worker.onerror = (err) => {
        console.log('[App:worker.onerror]', err);
        worker.terminate();
    };

    ReactGA.set({ cd3__workers: workerCount });
};

buildWorker();

const workerIsDead = () => {
    return new Date().getTime() - lastWorkerResponse > 10000;
};

setInterval(() => {
    emitter.emit(emitter.events.HealthCheck, {});

    if (workerIsDead()) {
        buildWorker();
    }

    worker.postMessage({ type: EmitEventNames.HealthCheck });
}, 9000);

export {};
