import React, { useEffect, useState } from 'react';

const useAsyncState = <T>(
    query: () => Promise<T> | undefined | null,
    deps: React.DependencyList,
) => {
    const [result] = useAsyncSetState(query, deps);

    return result;
};

export const useAsyncSetState = <T>(
    query: () => Promise<T | undefined> | undefined | null,
    deps: React.DependencyList,
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

        console.log('EYP');
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

export default useAsyncState;
