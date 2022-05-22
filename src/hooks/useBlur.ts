import React from 'react';
import { useSpring } from '@react-spring/web';
import { matchPath, useLocation } from 'react-router-dom';

import client from '@src/client';

export const useMatchArray = (pattern: Parameters<typeof matchPath>[0][]) => {
    // const location = useLocation();

    return useNoMatchArray(pattern);
};

export const useNoMatchArray = (pattern: Parameters<typeof matchPath>[0][]) => {
    const location = useLocation();

    return React.useMemo(
        () =>
            pattern.length === 0 ? false : pattern.every((x) => !matchPath(x, location.pathname)),
        [pattern, location],
    );
};

export default (path: string[]): CSSPropertiesAnimated => {
    const openModal = client.modal.useOpen();

    const match = useNoMatchArray(Array.isArray(path) ? path : [path]);

    const style = useSpring({
        filter: openModal || match ? 'blur(10px)' : 'blur(0px)',
    });

    return style;
};
