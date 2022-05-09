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
] => {
    const [result, setResult] = useState<T | null | undefined>();
    const [og, setOg] = useState<T | null | undefined>();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        try {
            const exec = async () => query && query();
            setLoading(true);
            void exec()
                .then((res) => {
                    setResult(res);
                    setOg(res);
                    setLoading(false);
                })
                .catch((err) => {
                    throw new Error(String(err));
                });
        } catch (err: unknown) {
            console.log('error in useAsyncState', err);
        }
    }, deps);

    return [result, setResult, og, loading];
};

export default useAsyncState;
