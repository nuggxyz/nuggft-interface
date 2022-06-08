import { useEffect } from 'react';

import emitter from '@src/emitter/core';
import { EmitEventsListCallback } from '@src/emitter/interfaces';

const useOnce = (a: EmitEventsListCallback) => {
    useEffect(() => {
        const _emit = emitter.once(a);
        return () => {
            _emit.off();
        };
    }, [a]);
    return null;
};

const useOn = (a: EmitEventsListCallback) => {
    useEffect(() => {
        const _emit = emitter.on(a);
        return () => {
            _emit.off();
        };
    }, [a]);
    return null;
};

// const useOn2 = <T>(
//     event: T extends EmitEvents
//         ? T['type'] extends infer R
//             ? R extends EmitEventNames
//                 ? R
//                 : never
//             : never
//         : never,
//     callback: (arg: T) => void,
// ) => {
//     useEffect(() => {
//         const _emit = emitter.on2(event, callback);
//         return () => {
//             _emit.off();
//         };
//     }, [event, callback]);
//     return null;
// };

// const usePipe = <T extends EmitEventsListCallback>(a: T['type']) => {
//     const [pipe, setPipe] = React.useState<Parameters<T['callback']>[0]>();

//     useOn({
//         type: a,
//         callback: React.useCallback(
//             (arg: typeof pipe) => {
//                 if (pipe !== arg && arg) setPipe(arg);
//             },
//             [setPipe, pipe],
//         ),
//     });

//     return pipe;
// };

export default { useOn, useOnce };
