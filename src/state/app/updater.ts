import { useEffect } from 'react';

import web3 from '@src/web3';
import * as state from '@src/state';

export default () => {
    const resizer = () => {
        state.default &&
            state.default.app.dispatch.setWindowDimensions({
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

    useEffect(() => {
        state.default && state.default.app.onRouteUpdate(chainId, window.location.hash);
    }, []);
    return null;
};
