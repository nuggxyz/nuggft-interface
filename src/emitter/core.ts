import EventEmitter3 from 'eventemitter3';

import { EmitEventNames, EmitEvents } from '@src/emitter/interfaces';

const ENABLE_LOGS = __DEV__;

const eventEmitter = new EventEmitter3();

const wrap = <T>(name: string, event: string, fn: (arg: T) => void) => {
    return (args: T) => {
        console.log(`event received: [${event}] [${name}] [payload:${JSON.stringify(args)}]`);
        fn(args);
    };
};

const emitter = Object.freeze({
    on: (event: string, fn: (arg: any) => void) =>
        eventEmitter.on(event, ENABLE_LOGS ? wrap('on', event, fn) : fn),
    once: (event: string, fn: (arg: any) => void) =>
        eventEmitter.once(event, ENABLE_LOGS ? wrap('once', event, fn) : fn),
    off: (event: string) => {
        if (ENABLE_LOGS) {
            wrap('removeListener', event, () => undefined);
        }
        return eventEmitter.removeAllListeners(event);
    },
    emit: (event: string, payload: any) => {
        if (ENABLE_LOGS) {
            const tmp = payload as { type?: EmitEventNames };
            if (typeof payload === 'object') {
                delete tmp.type;
            }
            console.log(`event emitted:  [${event}] [payload:${JSON.stringify(tmp)}]`);
        }
        eventEmitter.emit(event, payload);
    },
});

const on = <R extends EmitEventNames, T extends EmitEvents>(
    event: R,
    callback: (
        arg: T extends infer G
            ? G extends EmitEvents
                ? G['type'] extends R
                    ? G
                    : never
                : never
            : never,
    ) => void,
): (() => void) => {
    if (ENABLE_LOGS) console.log(`on call:  [${event}]`);

    void emitter.on(event, callback);
    return () => {
        if (ENABLE_LOGS) console.log(`on close: [${event}]`);

        const a = emitter.off(event);

        if (ENABLE_LOGS) console.log(a.listeners(event));
    };
};

const once: typeof on = (event, callback) => {
    void emitter.once(event, callback);
    return () => emitter.off(event);
};

const emit = <R extends EmitEventNames, T extends EmitEvents>(
    event: R,
    input: Remap<
        Omit<
            T extends infer G
                ? G extends EmitEvents
                    ? G['type'] extends R
                        ? G
                        : never
                    : never
                : never,
            'type'
        >
    >,
) => emitter.emit(event, { ...input, type: event });

const wrapper = {
    on,
    emit,
    once,
};

if (ENABLE_LOGS) {
    eventEmitter.on('dev.log', (data) => {
        console.log(data);
    });
}

export default wrapper;
