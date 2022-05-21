import EventEmitter3 from 'eventemitter3';

import { EmitEventsListCallback, EmitEventsListPayload } from './interfaces';

const eventEmitter = new EventEmitter3();

const emitter = Object.freeze({
    on: (event: string, fn: (arg: any) => void) => eventEmitter.on(event, fn),
    once: (event: string, fn: (arg: any) => void) => eventEmitter.once(event, fn),
    off: (event: string, fn: (arg: any) => void) => eventEmitter.off(event, fn),
    emit: (event: string, payload: any) => eventEmitter.emit(event, payload),
});

const on = (input: Remap<EmitEventsListCallback>): { off: () => void } => {
    void emitter.on(input.type, input.callback);
    return { off: () => emitter.off(input.type, input.callback) };
};
const emit = (input: Remap<EmitEventsListPayload>) => emitter.emit(input.type, input);

const wrapper = {
    on,
    emit,
    once: (input: Remap<EmitEventsListCallback>): { off: () => void } => {
        void emitter.once(input.type, input.callback);
        return { off: () => emitter.off(input.type, input.callback) };
    },
    wait: async <T extends EmitEventsListPayload>(
        input: Remap<EmitEventsListPayload>,
        worker: Worker,
    ) => {
        emit(input);
        return new Promise((resolve) => {
            if (worker && input.waitFor !== undefined) {
                void emitter.once(input.waitFor, resolve);
                worker.postMessage(input);
            } else resolve(null);
        }) as Promise<(T['waitFor'] extends infer R ? R : null) | null>;
    },
};

export default wrapper;
