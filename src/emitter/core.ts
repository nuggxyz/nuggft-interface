import EventEmitter3 from 'eventemitter3';

import { EmitEventNames, EmitEvents } from '@src/emitter/interfaces';

const ENABLE_LOGS = false;

const eventEmitter = new EventEmitter3();

const emitter = Object.freeze({
    on: (event: string, fn: (arg: any) => void) => eventEmitter.on(event, fn),
    once: (event: string, fn: (arg: any) => void) => eventEmitter.once(event, fn),
    off: (event: string, fn: (arg: any) => void) => {
        return eventEmitter.removeListener(event, fn);
    },
    emit: (event: string, payload: any) => {
        eventEmitter.emit(event, payload);

        if (ENABLE_LOGS) {
            const tmp = payload as { type?: EmitEventNames };
            if (typeof payload === 'object') {
                delete tmp.type;
            }
            console.log(`event emitted:  [${event}] [payload:${JSON.stringify(tmp)}]`);
        }
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
    const id = Math.random().toFixed(10);
    const b = emitter.on(event, callback);
    const kill = emitter.off.bind(emitter, event, callback);

    if (ENABLE_LOGS) {
        console.log(
            `sub open [on]: [${event}] [id:${id}] -- active events: [${event}:${
                b.listeners(event).length
            }] [total:${(b as unknown as { _eventsCount?: number })?._eventsCount || 'unknown'}]`,
        );
    }
    return () => {
        const a = kill();

        if (ENABLE_LOGS) {
            console.log(
                `sub close [on]: [${event}] [id:${id}] -- active events: [${event}:${
                    a.listeners(event).length
                }] [total:${
                    (a as unknown as { _eventsCount?: number })?._eventsCount || 'unknown'
                }]`,
            );
        }
    };
};

const once: typeof on = (event, callback) => {
    const me = callback;

    void emitter.once(event, callback);
    return () => emitter.off(event, me);
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
