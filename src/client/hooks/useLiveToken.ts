/* eslint-disable import/no-cycle */
import React from 'react';

import { Lifecycle, LiveToken } from '@src/client/interfaces';
import { Address } from '@src/classes/Address';
import { TokenId } from '@src/client/router';

import client from '..';

import useLiveItem from './useLiveItem';
import useLiveNugg from './useLiveNugg';

export default (tokenId: TokenId | undefined) => {
    const epoch = client.live.epoch.id();

    const updateToken = client.mutate.updateToken();

    const onNewData = React.useCallback(
        (token: LiveToken) => {
            if (tokenId) {
                const getLifecycle = (): Lifecycle => {
                    if (token && epoch !== undefined) {
                        if (!token.activeSwap?.id) {
                            if (token.type === 'item' && token.swaps.length > 0)
                                return Lifecycle.Tryout;
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
                };
                updateToken(tokenId, { ...token, lifecycle: getLifecycle() });
            }
        },
        [updateToken, tokenId, epoch],
    );

    // since a component calling this will need to compleetly rerender when the tokenId changes
    //      + we can safely ignore the rules-of-hooks here
    if (tokenId?.startsWith('item-')) useLiveItem(tokenId.replace('item-', ''), onNewData);
    else useLiveNugg(tokenId, onNewData);

    return null;
};
