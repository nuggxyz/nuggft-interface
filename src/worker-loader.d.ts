declare module '*.worker.ts' {
    // You need to change `Worker`, if you specified a different value for the `workerType` option
    class Worker extends Worker {
        constructor();
        postMessage();
    }

    // Uncomment this if you set the `esModule` option to `false`
    // export = Worker;
    export default Worker;
}
