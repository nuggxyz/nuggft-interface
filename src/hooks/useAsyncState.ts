import React, { useEffect, useState } from 'react';

const useAsyncState = <T>(query: () => T, deps: React.DependencyList) => {
    const [result, setResult] = useState<T>();

    useEffect(() => {
        const exec = async () => await query();
        exec().then((res) => setResult(res));
    }, deps);

    return result;
};

export default useAsyncState;
