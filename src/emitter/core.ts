import EventEmitter3 from 'eventemitter3';

import { EmitEventsListCallback, EmitEventsListPayload } from './interfaces';

const eventEmitter = new EventEmitter3();

const emitter = Object.freeze({
    on: (event: string, fn: (arg: any) => void) => eventEmitter.on(event, fn),
    once: (event: string, fn: (arg: any) => void) => eventEmitter.once(event, fn),
    off: (event: string, fn: (arg: any) => void) => eventEmitter.off(event, fn),
    emit: (event: string, payload: any) => eventEmitter.emit(event, payload),
});

const wrapper = {
    on: (input: Remap<EmitEventsListCallback>): { off: () => void } => {
        void emitter.on(input.type, input.callback);
        return { off: () => emitter.off(input.type, input.callback) };
    },
    once: (input: Remap<EmitEventsListCallback>): { off: () => void } => {
        void emitter.once(input.type, input.callback);
        return { off: () => emitter.off(input.type, input.callback) };
    },
    emit: (input: Remap<EmitEventsListPayload>) => emitter.emit(input.type, input),
};

export default wrapper;
