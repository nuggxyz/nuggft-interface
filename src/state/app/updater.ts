import { useEffect } from 'react';

import config from '@src/web3/config';

import AppState from '.';

export default () => {
    const resizer = () => {
        AppState.dispatch.setWindowDimensions({
            height: window.innerHeight,
            width: window.innerWidth,
        });
    };

    const chainId = config.priority.usePriorityChainId();

    useEffect(() => {
        resizer();
        window.addEventListener('resize', resizer);
        return () => {
            window.removeEventListener('resize', resizer);
        };
    }, []);

    useEffect(() => {
        AppState.onRouteUpdate(chainId, window.location.hash);
    }, []);
    return null;
};
