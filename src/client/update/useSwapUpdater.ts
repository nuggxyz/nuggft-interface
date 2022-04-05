import { useEffect } from 'react';
import { useLocation, useNavigate, useMatch } from 'react-router-dom';

import client from '@src/client';
import useTokenQuery from '@src/client/hooks/useTokenQuery';

/// goal here is to trigger a update on swap change
export default () => {
    const match = useMatch('/swap/:id');
    const location = useLocation();
    const navigate = useNavigate();

    const lastSwap = client.live.lastSwap.tokenId();

    const setLastSwap = client.mutate.setLastSwap();

    const epoch = client.live.epoch.id();

    const startup = useTokenQuery();

    useEffect(() => {
        if (epoch) {
            let goto = String(epoch);
            if (location.pathname === '/') {
                navigate(`/swap/${goto}`);
            } else {
                goto = match?.params.id || goto;
            }
            if ((lastSwap === undefined || match?.params.id) && lastSwap !== goto) {
                setLastSwap(goto);
                void startup(goto);
            }
        }
    }, [location.pathname, navigate, match, lastSwap, setLastSwap, epoch, startup]);

    return null;
};
