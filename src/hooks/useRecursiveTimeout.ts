import { useEffect, useRef } from 'react';

// adapted from https://www.aaron-powell.com/posts/2019-09-23-recursive-settimeout-with-react-hooks/

function useRecursiveTimeout<T>(callback: () => Promise<T> | void, delay: number | null) {
    const savedCallback = useRef(callback);

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the timeout loop.
    useEffect(() => {
        let id: NodeJS.Timeout;
        function tick() {
            console.log('Tick');
            const ret = savedCallback.current();

            if (ret instanceof Promise) {
                void ret.then(() => {
                    if (delay !== null) {
                        id = setTimeout(tick, delay);
                    }
                });
            } else if (delay !== null) {
                id = setTimeout(tick, delay);
            }
        }
        if (delay !== null) {
            tick(); // setTimeout(tick, delay);
            return () => id && clearTimeout(id);
        }
        return undefined;
    }, [delay]);

    return null;
}

export default useRecursiveTimeout;
