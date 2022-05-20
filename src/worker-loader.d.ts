declare module '*.worker.ts' {
    // You need to change `Worker`, if you specified a different value for the `workerType` option
    class WebpackWorker extends Worker {
        constructor();
    }

    export declare const window = Window;

    // Uncomment this if you set the `esModule` option to `false`
    // export = WebpackWorker;
    export default WebpackWorker;
}
