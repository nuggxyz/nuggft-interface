import EventEmitter3 from 'eventemitter3';

import { EmitEventNames, EmitEvents } from '@src/emitter/interfaces';

const eventEmitter = new EventEmitter3();

const emitter = Object.freeze({
    on: (event: string, fn: (arg: any) => void) => eventEmitter.on(event, fn),
    once: (event: string, fn: (arg: any) => void) => eventEmitter.once(event, fn),
    off: (event: string, fn: (arg: any) => void) => eventEmitter.removeListener(event, fn),
    emit: (event: string, payload: any) => eventEmitter.emit(event, payload),
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
    void emitter.on(event, callback);
    return () => emitter.off(event, callback);
};

const once: typeof on = (event, callback) => {
    void emitter.once(event, callback);
    return () => emitter.off(event, callback);
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
