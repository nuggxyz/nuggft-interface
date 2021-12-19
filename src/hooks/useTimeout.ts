import { useEffect } from 'react';

type Props = {};

const useTimeout = (callback: () => void, timeout: number) => {
    useEffect(() => {
        const id = setTimeout(callback, timeout);
        return () => clearTimeout(id);
    }, [callback, timeout]);
};

export default useTimeout;
