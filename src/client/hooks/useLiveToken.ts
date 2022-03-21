import React from 'react';

import { Address } from '@src/classes/Address';
import { TokenId } from '@src/client/router';

// eslint-disable-next-line import/no-cycle
import client from '..';

// eslint-disable-next-line import/no-cycle
import { LiveItem, useLiveItem } from './useLiveItem';
// eslint-disable-next-line import/no-cycle
import { LiveNugg, useLiveNugg } from './useLiveNugg';

export enum Lifecycle {
    Stands = 'stands', // [nugg/item] a token that has no active swap
    Bench = 'bench', //   [nugg/item] a token that is for sale, but no one has bid on it
    Deck = 'deck', //     [nugg/item] a token that is for sale, someone has bid on it, but it is not yet the final epoch
    Bat = 'bat', //       [nugg/item] a token that is for sale, and it is in the final epoch
    Shower = 'shower', // [nugg/item] active swap exists, but none of the others hit. ** i honestly dont even think it can hit this bc the graph catches it
    Tryout = 'tryout', // [     item] a token that has no active sale, but one to many non-active sales
    Cut = 'cut', //       [nugg     ] a token that no one bid on but still exists in the graph
    Egg = 'egg', //       [nugg     ] a token that will be minting in the next epoch --- SAME AS DECK, BUT NON OFFERABLE
}

export type LiveToken = LiveNugg | LiveItem;

export default (
    tokenId: TokenId | undefined,
): {
    token: LiveToken | undefined;
    lifecycle: Lifecycle;
    epoch: number | undefined;
} => {
    const epoch = client.live.epoch.id();

    // since a component calling this will need to compleetly rerender when the tokenId changes
    //      + we can safely ignore the rules-of-hooks here
    const token = tokenId?.startsWith('item-')
        ? // eslint-disable-next-line react-hooks/rules-of-hooks
          useLiveItem(tokenId.replace('item-', ''))
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

    return { token, lifecycle, epoch };
};
