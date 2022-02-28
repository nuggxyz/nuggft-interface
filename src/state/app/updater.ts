import { useEffect } from 'react';

import web3 from '@src/web3';

export default () => {
    const resizer = () => {
        import('@src/state').then((state) =>
            state.default.app.dispatch.setWindowDimensions({
                height: window.innerHeight,
                width: window.innerWidth,
            }),
        );
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
        import('@src/state').then(
            (state) => state && state.default.app.onRouteUpdate(chainId, window.location.hash),
        );
    }, []);
    return null;
};
