import { useEffect } from 'react';
import { useLocation, useNavigate, useMatch } from 'react-router-dom';

import client from '@src/client';
import useTokenQuery from '@src/client/hooks/useTokenQuery';
import useDimentions from '@src/client/hooks/useDimentions';

/// goal here is to trigger a update on swap change
export default () => {
    const match = useMatch('/swap/:id');
    const location = useLocation();
    const navigate = useNavigate();

    const lastSwap = client.live.lastSwap.tokenId();

    const setLastSwap = client.mutate.setLastSwap();

    const epoch = client.live.epoch.id();

    const startup = useTokenQuery();
    const { isPhone } = useDimentions();
    useEffect(() => {
        if (epoch && !isPhone) {
            let goto = epoch.toNuggId() as TokenId;
            if (location.pathname === '/') {
                navigate(`/swap/${goto}`);
            } else {
                goto = (match?.params.id as TokenId) || goto;
            }
            if ((lastSwap === undefined || match?.params.id) && lastSwap !== goto) {
                setLastSwap(goto);
                void startup(goto);
            }
        }
    }, [location.pathname, navigate, match, lastSwap, setLastSwap, epoch, startup, isPhone]);

    return null;
};
