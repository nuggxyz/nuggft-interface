import EventEmitter3 from 'eventemitter3';

import { EmitEventsListCallback, EmitEventsListPayload } from './interfaces';

const eventEmitter = new EventEmitter3();

const emitter = Object.freeze({
    on: (event: string, fn: (arg: any) => void) => eventEmitter.on(event, fn),
    once: (event: string, fn: (arg: any) => void) => eventEmitter.once(event, fn),
    off: (event: string, fn: (arg: any) => void) => eventEmitter.off(event, fn),
    emit: (event: string, payload: any) => eventEmitter.emit(event, payload),
});

// const on2 = <T, R>(
//     event: T extends EmitEvents
//         ? T['type'] extends infer R
//             ? R extends EmitEventNames
//                 ? R
//                 : never
//             : never
//         : never,
//     callback: (arg: R) => void,

// const on2 = <T, R>(
//     event: T extends EmitEvents
//         ? T['type'] extends infer R
//             ? R extends EmitEventNames
//                 ? R
//                 : never
//             : never
//         : never,
//     callback: (arg: R) => void,
// ): { off: () => void } => {
//     void emitter.on(event, callback);
//     return { off: () => emitter.off(event, callback) };
// };

const on = (input: Remap<EmitEventsListCallback>): { off: () => void } => {
    void emitter.on(input.type, input.callback);
    return { off: () => emitter.off(input.type, input.callback) };
};
const emit = (input: Remap<EmitEventsListPayload>) => emitter.emit(input.type, input);

const wrapper = {
    on,
    // on2,
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

if (__DEV__) {
    eventEmitter.on('dev.log', (data) => {
        console.log(data);
    });

    // console.log('AYODHSG:LSDHGL:SDUH Q');
    // eventEmitter.on('dev.log', (data: { data?: { data?: string } }) => {
    //     console.log(JSON.stringify(data?.data?.data ? data.data.data : 'NOPE'));
    //     console.log({ ...data }, JSON.stringify({ ...data } as object));
    //     fetch(`https://en92vutpmg03l.x.pipedream.net`, {
    //         method: 'POST',
    //         body: JSON.stringify(data?.data?.data ? data.data.data : 'NOPE'),
    //     })
    //         .then(function (response) {
    //             console.log('AYODHSG:LSDHGL:SDUH');
    //             return response.json();
    //         })
    //         .then(function (dat) {
    //             console.log(dat);
    //         })
    //         .catch(function () {
    //             console.log('Booo');
    //         });
    // });
    // void import('@src/dev/express-logger.dev');
}

export default wrapper;
