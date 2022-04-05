import { RefObject, useEffect, useRef } from 'react';

const useOnClickOutside = <T extends HTMLElement>(
    node: RefObject<T | undefined>,
    handler: undefined | ((e: MouseEvent) => void),
) => {
    const handlerRef = useRef<undefined | ((e: MouseEvent) => void)>(handler);
    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (node.current?.contains(e.target as Node) ?? false) {
                return;
            }
            if (handlerRef.current) handlerRef.current(e);
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [node]);
};

export default useOnClickOutside;
