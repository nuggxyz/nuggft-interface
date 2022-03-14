import React, { useEffect, useState } from 'react';

const useAsyncState = <T>(
    query: () => Promise<T> | undefined | null,
    deps: React.DependencyList,
) => {
    const [result, setResult] = useState<T | null | undefined>();

    useEffect(() => {
        try {
            const exec = async () => query && query();
            void exec().then((res) => setResult(res));
        } catch (err: unknown) {
            console.log('error in useAsyncState');
        }
    }, deps);

    return result;
};

export default useAsyncState;
