import React from 'react';

import swaps from '@src/client/swaps';

import client from '..';

export default (tokenId?: TokenId) => {
    const swap = swaps.useSwap(tokenId);

    const supp = client.live.offers(tokenId);

    return React.useMemo(
        () =>
            [...(swap?.offers || [])].mergeInPlaceReturnRef(
                [...supp],
                'account',
                (a, b) => b.eth.gt(a.eth),
                (a, b) => (a.eth.gt(b.eth) ? -1 : 1),
            ),
        [swap, supp],
    );
};
