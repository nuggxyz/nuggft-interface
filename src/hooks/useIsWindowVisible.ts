import { useCallback, useEffect, useState } from 'react';

import { gatsbyDOM } from '@src/lib/index';

const VISIBILITY_STATE_SUPPORTED = gatsbyDOM('document') && 'visibilityState' in document;

function isWindowVisible() {
    return (
        gatsbyDOM('document') &&
        (!VISIBILITY_STATE_SUPPORTED || document.visibilityState !== 'hidden')
    );
}

export default function useIsWindowVisible(): boolean {
    const [focused, setFocused] = useState<boolean>(isWindowVisible());
    const listener = useCallback(() => {
        setFocused(isWindowVisible());
    }, [setFocused]);

    useEffect(() => {
        if (!VISIBILITY_STATE_SUPPORTED) return undefined;

        if (gatsbyDOM('document')) {
            document.addEventListener('visibilitychange', listener);
            return () => {
                document.removeEventListener('visibilitychange', listener);
            };
        }
    }, [listener]);

    return focused;
}
