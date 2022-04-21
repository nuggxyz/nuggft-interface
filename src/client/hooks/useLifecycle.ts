import React from 'react';

import client from '@src/client';
import { Lifecycle, LiveToken } from '@src/client/interfaces';
import { Address } from '@src/classes/Address';

export default (token?: LiveToken): Lifecycle | undefined => {
    const epoch = client.live.epoch.default();

    const blocknum = client.live.blocknum();

    return React.useMemo(() => {
        if (!token) return undefined;

        if (token.isItem() && !token.activeSwap && token.upcomingActiveSwap) {
            token.activeSwap = token.upcomingActiveSwap;
            delete token.upcomingActiveSwap;
        }

        if (token && epoch !== undefined) {
            if (!token.activeSwap?.tokenId) {
                if (token.isItem() && token.swaps.length > 0) return Lifecycle.Tryout;
                return Lifecycle.Stands;
            }

            if (!token.activeSwap.endingEpoch) return Lifecycle.Bench;

            if (+token.activeSwap.endingEpoch === epoch.id + 1) {
                if (token.type === 'nugg' && token.owner === Address.ZERO.hash) {
                    return Lifecycle.Egg;
                }
                return Lifecycle.Deck;
            }

            if (
                token.activeSwap.leader === Address.ZERO.hash &&
                token.activeSwap.epoch &&
                blocknum &&
                (+token.activeSwap.epoch.startblock + 255 - blocknum < 16 ||
                    +token.activeSwap.epoch.endblock < blocknum)
            ) {
                return Lifecycle.Cut;
            }

            if (+token.activeSwap.endingEpoch === epoch.id) {
                if (token.type === 'nugg' && token.owner === Address.ZERO.hash) {
                    return Lifecycle.Bunt;
                }
                return Lifecycle.Bat;
            }

            return Lifecycle.Shower;
        }
        return Lifecycle.Stands;
    }, [epoch, blocknum, token]);
};
