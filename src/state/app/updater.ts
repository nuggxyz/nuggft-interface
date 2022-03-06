import { useEffect } from 'react';

import web3 from '@src/web3';

import AppState from './index';

export default () => {
    const resizer = () => {
        AppState.dispatch.setWindowDimensions({
            height: window.innerHeight,
            width: window.innerWidth,
        });
    };

    const chainId = web3.hook.usePriorityChainId();

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
