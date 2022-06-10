import React, { useEffect, DependencyList } from 'react';

import emitter from '@src/emitter/core';

import { EmitEventNames, EmitEvents } from './interfaces';

const useOn = <R extends EmitEventNames, T extends EmitEvents>(
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
    deps: DependencyList = [],
) => {
    const user = React.useCallback(callback, deps);

    useEffect(() => {
        const close = emitter.on(event, user);
        return () => {
            close();
        };
    }, [user]);
    return null;
};

const useOnce: typeof useOn = (event, callback, deps = []) => {
    const user = React.useCallback(callback, deps);

    useEffect(() => {
        const close = emitter.once(event, user);
        return () => {
            close();
        };
    }, [user]);
    return null;
};

export default { useOn, useOnce };
