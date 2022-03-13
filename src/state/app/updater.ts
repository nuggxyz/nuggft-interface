import { useEffect } from 'react';

// eslint-disable-next-line import/no-cycle
import AppState from './index';

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

    // useEffect(() => {
    //     AppState.onRouteUpdate(chainId, window.location.hash);
    // }, []);
    return null;
};
