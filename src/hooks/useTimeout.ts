import React, { useEffect } from 'react';

type Props = Record<string, never>;

const useTimeout = (callback: () => void, timeout: number, deps?: React.DependencyList) => {
    useEffect(() => {
        const id = setTimeout(callback, timeout);
        return () => clearTimeout(id);
    }, [callback, timeout, deps]);
};

export default useTimeout;
