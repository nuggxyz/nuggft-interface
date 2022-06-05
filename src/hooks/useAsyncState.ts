import React, { useEffect, useState, DependencyList } from 'react';

import usePrevious from '@src/hooks/usePrevious';

const useAsyncState = <T, G extends DependencyList>(
    query: () => Promise<T | undefined> | undefined | null,
    deps: G,
) => {
    const [result] = useAsyncSetState(query, deps);

    return result;
};

//
export const useAsyncSetState = <T, G extends DependencyList>(
    query: () => Promise<T | undefined> | undefined | null,
    deps: G,
): [
    T | null | undefined,
    React.Dispatch<React.SetStateAction<T | null | undefined>>,
    T | null | undefined,
    boolean,
    string | undefined,
] => {
    const [result, setResult] = useState<T | null | undefined>();
    const [og, setOg] = useState<T | null | undefined>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>();

    useEffect(() => {
        let stale = false;

        try {
            const exec = async () => query && query();
            setLoading(true);
            void exec()
                .then((res) => {
                    if (!stale) {
                        setResult(res);
                        setOg(res);
                        setLoading(false);
                        setError(undefined);
                    }
                })
                .catch((err) => {
                    if (!stale) {
                        setError(String(error));
                        throw new Error(String(err));
                    }
                });
        } catch (err: unknown) {
            console.log('error in useAsyncState', err);
        }
        return () => {
            stale = true;
        };
    }, deps);

    return [result, setResult, og, loading, error];
};

export const useMemoizedAsyncState = <T, G extends DependencyList>(
    query: () => Promise<T | undefined> | undefined | null,
    deps: Readonly<G>,
    depsEqual?: (prev: G, curr: G, lastRes: T | null | undefined) => boolean,
) => {
    const [result] = useMemoizedAsyncSetState(query, deps, depsEqual);

    return result;
};

export const useMemoizedAsyncSetState = <T, G extends DependencyList>(
    query: () => Promise<T | undefined> | undefined | null,
    deps: Readonly<G>,
    depsEqual?: (prev: G, curr: G, lastRes: T | null | undefined) => boolean,
): [
    T | null | undefined,
    React.Dispatch<React.SetStateAction<T | null | undefined>>,
    T | null | undefined,
    boolean,
    string | undefined,
] => {
    const [result, setResult] = useState<T | null | undefined>();
    const [og, setOg] = useState<T | null | undefined>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>();

    const prev = usePrevious(deps);

    const caller = React.useCallback(() => {
        if (depsEqual && prev && depsEqual(prev, deps, result)) return undefined;
        return query;
    }, [depsEqual, prev, deps, query, result]);

    useEffect(() => {
        let stale = false;

        const query2 = caller();

        if (!query2) return undefined;

        try {
            const exec = async () => query2 && query2();
            setLoading(true);
            void exec()
                .then((res) => {
                    if (!stale) {
                        setResult(res);
                        setOg(res);
                        setLoading(false);
                        setError(undefined);
                    }
                })
                .catch((err) => {
                    if (!stale) {
                        setError(String(error));
                        throw new Error(String(err));
                    }
                });
        } catch (err: unknown) {
            console.log('error in useAsyncState', err);
        }
        return () => {
            stale = true;
        };
    }, deps);

    return [result, setResult, og, loading, error];
};

export default useAsyncState;
