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

export default { useOn, useOnce };
