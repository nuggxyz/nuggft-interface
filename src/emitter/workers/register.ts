import ReactGA from 'react-ga4';

import { EmitEventNames, EmitWorkerEventBase } from '@src/emitter/interfaces';

import emitter from '..';

let worker: Worker & { isRunning?: boolean };

let workerCount = 0;

let lastWorkerResponse = new Date().getTime();

const buildWorker = () => {
    if (worker) worker.terminate();

    worker = new Worker(new URL('./rpc.worker.ts', import.meta.url));

    console.log('[App] MyWorker instance:', worker);

    worker.onmessage = ({ data }: { data: EmitWorkerEventBase }) => {
        lastWorkerResponse = new Date().getTime();
        emitter.emit(data);
    };

    worker.onerror = () => {
        worker.terminate();
    };

    if (!__DEV__) ReactGA.set({ cd3__workers: workerCount++ });
};

buildWorker();

const workerIsDead = () => {
    return new Date().getTime() - lastWorkerResponse > 2000;
};

setInterval(() => {
    emitter.emit({ type: emitter.events.HealthCheck });

    if (workerIsDead()) {
        buildWorker();
    }

    worker.postMessage({ type: EmitEventNames.HealthCheck });
}, 1000);

export {};
