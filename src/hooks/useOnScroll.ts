import { RefCallback, useEffect, useRef, useState } from 'react';
import { throttle } from 'lodash';

function useOnScroll(
    callback?: RefCallback<{
        previousScrollTop: number;
        currentScrollTop: number;
    }>,
) {
    const [, setScrollPosition] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    let previousScrollTop = 0;

    function handleDocumentScroll() {
        const { scrollTop: currentScrollTop } =
            ref.current || document.documentElement || document.body;

        setScrollPosition((previousPosition) => {
            previousScrollTop = previousPosition;
            return currentScrollTop;
        });

        callback && callback({ previousScrollTop, currentScrollTop });
    }

    const handleDocumentScrollThrottled = throttle(handleDocumentScroll, 250);

    useEffect(() => {
        let current = ref.current !== undefined && ref.current !== null ? ref.current : document;
        current.addEventListener('scroll', handleDocumentScrollThrottled);

        return () => current.removeEventListener('scroll', handleDocumentScrollThrottled);
        // LOGIC CHANGE
    }, [ref, handleDocumentScrollThrottled]);

    return ref;
}

export default useOnScroll;
