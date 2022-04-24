import React from 'react';

import client from '@src/client';
import { Lifecycle, LiveToken } from '@src/client/interfaces';
import { Address } from '@src/classes/Address';
import { SwapData } from '@src/client/swaps';

export default (token?: LiveToken | SwapData): Lifecycle | undefined => {
    const epoch = client.live.epoch.default();

    const blocknum = client.live.blocknum();

    return React.useMemo(() => {
        if (!token) return undefined;

        const isToken = 'activeSwap' in token;

        let abc = (isToken ? token.activeSwap : token) as SwapData;

        // if (!abc) return undefined;

        if (
            isToken &&
            token.isItem() &&
            !abc &&
            'upcomingActiveSwap' in token &&
            token.upcomingActiveSwap
        ) {
            abc = token.upcomingActiveSwap;
            delete token.upcomingActiveSwap;
        }

        if (abc && epoch !== undefined) {
            if (abc.isItem() && abc.isTryout) {
                return Lifecycle.Tryout;
            }

            if (!abc.endingEpoch) return Lifecycle.Bench;

            if (+abc.endingEpoch === epoch.id + 1) {
                if (abc.type === 'nugg' && abc.owner === Address.ZERO.hash) {
                    return Lifecycle.Egg;
                }
                return Lifecycle.Deck;
            }

            if (
                abc.leader === Address.ZERO.hash &&
                abc.epoch &&
                blocknum &&
                (+abc.epoch.startblock + 255 - blocknum < 16 || +abc.epoch.endblock < blocknum)
            ) {
                return Lifecycle.Cut;
            }

            if (+abc.endingEpoch === epoch.id) {
                if (abc.type === 'nugg' && abc.owner === Address.ZERO.hash) {
                    return Lifecycle.Bunt;
                }
                return Lifecycle.Bat;
            }

            return Lifecycle.Shower;
        }
        return Lifecycle.Stands;
    }, [epoch, blocknum, token]);
};
