import React from 'react';
import { useSpring } from '@react-spring/web';
import { matchPath, useLocation } from 'react-router-dom';

import AppState from '@src/state/app';

const useNoMatchArray = (pattern: string[]) => {
    const location = useLocation();

    return React.useMemo(
        () =>
            pattern.length === 0 ? false : pattern.every((x) => !matchPath(x, location.pathname)),
        [pattern, location],
    );
};

export default (path: string[]): CSSPropertiesAnimated => {
    const modal = AppState.select.modalIsOpen();

    const match = useNoMatchArray(Array.isArray(path) ? path : [path]);

    const style = useSpring({
        filter: modal || match ? 'blur(10px)' : 'blur(0px)',
    });

    return style;
};
