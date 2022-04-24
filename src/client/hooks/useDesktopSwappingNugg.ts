import React from 'react';
import { useMatch } from 'react-router';

import client from '..';

export default (manualOverride?: TokenId) => {
    const ls = client.live.lastSwap.tokenId();

    const match = useMatch('/swap/:lastSwap');

    return React.useMemo(() => {
        return manualOverride ?? ls ?? (match?.params.lastSwap as TokenId);
    }, [manualOverride, match, ls]);
};
