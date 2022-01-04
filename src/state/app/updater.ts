import { useEffect } from 'react';

import AppState from '.';

export default () => {
    const resizer = () => {
        AppState.dispatch.setWindowDimensions({
            height: window.innerHeight,
            width: window.innerWidth,
        });
    };

    useEffect(() => {
        resizer();
        window.addEventListener('resize', resizer);
        return () => {
            window.removeEventListener('resize', resizer);
        };
    }, []);

    useEffect(() => {
        AppState.onRouteUpdate(window.location.hash);
    }, []);
    return null;
};
