import React, { useEffect } from 'react';

import constants, { ITEM_ID } from '@src/lib/constants';
import { Address } from '@src/classes/Address';

// eslint-disable-next-line import/no-cycle
import core from '@src/client/core';

// eslint-disable-next-line import/no-cycle
import client from '..';

// eslint-disable-next-line import/no-cycle
import { useLiveItem } from './useLiveItem';
// eslint-disable-next-line import/no-cycle
import { useLiveNugg } from './useLiveNugg';
// eslint-disable-next-line import/no-cycle
import { Lifecycle } from './useLiveToken';

export default (tokenId: string | ITEM_ID | undefined) => {
    const epoch = client.live.epoch.id();

    // since a component calling this will need to compleetly rerender when the tokenId changes
    //      + we can safely ignore the rules-of-hooks here
    const token = tokenId?.startsWith(constants.ID_PREFIX_ITEM)
        ? // eslint-disable-next-line react-hooks/rules-of-hooks
          useLiveItem(tokenId)
        : // eslint-disable-next-line react-hooks/rules-of-hooks
          useLiveNugg(tokenId);

    const lifecycle: Lifecycle = React.useMemo(() => {
        if (token && epoch !== undefined) {
            if (!token.activeSwap?.id) {
                if (token.type === 'item' && token.swaps.length > 0) return Lifecycle.Tryout;
                return Lifecycle.Stands;
            }

            if (!token.activeSwap.endingEpoch) return Lifecycle.Bench;
            if (+token.activeSwap.endingEpoch === epoch + 1) {
                if (token.type === 'nugg' && token.owner === Address.ZERO.hash) {
                    return Lifecycle.Egg;
                }
                return Lifecycle.Deck;
            }
            if (+token.activeSwap.endingEpoch === epoch) return Lifecycle.Bat;
            return Lifecycle.Shower;
        }
        return Lifecycle.Stands;
    }, [epoch, token]);

    useEffect(() => {
        core.actions.updateLifecycle(lifecycle);
    }, [lifecycle]);
    useEffect(() => {
        core.actions.updateToken(token);
    }, [token]);
};
