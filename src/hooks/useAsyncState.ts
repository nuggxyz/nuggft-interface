import React, { useEffect, useState } from 'react';

const useAsyncState = <T>(
    query: () => Promise<T> | undefined | null,
    deps: React.DependencyList,
) => {
    const [result] = useAsyncSetState(query, deps);

    return result;
};

export const useAsyncSetState = <T>(
    query: () => Promise<T> | undefined | null,
    deps: React.DependencyList,
): [
    T | null | undefined,
    React.Dispatch<React.SetStateAction<T | null | undefined>>,
    T | null | undefined,
] => {
    const [result, setResult] = useState<T | null | undefined>();
    const [og, setOg] = useState<T | null | undefined>();

    useEffect(() => {
        try {
            const exec = async () => query && query();
            void exec().then((res) => {
                setResult(res);
                setOg(res);
            });
        } catch (err: unknown) {
            console.log('error in useAsyncState');
        }
    }, deps);

    return [result, setResult, og];
};

export default useAsyncState;
