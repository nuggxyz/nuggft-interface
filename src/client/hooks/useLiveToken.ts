import React from 'react';

import constants, { ITEM_ID } from '@src/lib/constants';
import { Address } from '@src/classes/Address';

import client from '..';

import { LiveItem, useLiveItem } from './useLiveItem';
import { LiveNugg, useLiveNugg } from './useLiveNugg';

type NuggLifeCyle =
    | 'stands' // [nugg/item] a token that has no active swap
    | 'bench' //  [nugg/item] a token that is for sale, but no one has bid on it
    | 'deck' //   [nugg/item] a token that is for sale, someone has bid on it, but it is not yet the final epoch
    | 'bat' //    [nugg/item] a token that is for sale, and it is in the final epoch
    | 'shower' // [nugg/item] active swap exists, but none of the others hit. ** i honestly dont even think it can hit this bc the graph catches it
    | 'tryout' // [     item] a token that has no active sale, but one to many non-active sales
    | 'cut' //    [nugg     ] a token that no one bid on but still exists in the graph
    | 'egg'; //   [nugg     ] a token that will be minting in the next epoch --- SAME AS DECK, BUT NON OFFERABLE

export const useLiveToken = (
    tokenId: string | ITEM_ID,
): { token: LiveNugg | LiveItem; lifecycle: NuggLifeCyle; epoch: number } => {
    const epoch = client.live.epoch__id();

    const token =
        tokenId && tokenId.startsWith(constants.ID_PREFIX_ITEM)
            ? useLiveItem(tokenId)
            : useLiveNugg(tokenId);

    const lifecycle = React.useMemo(() => {
        if (token) {
            if (!token.activeSwap.id) {
                if (token.type === 'item' && token.swaps.length > 0) return 'tryout';
                return 'stands';
            }

            if (!token.activeSwap.endingEpoch) return 'bench';
            if (+token.activeSwap.endingEpoch === epoch + 1) {
                if (token.type === 'nugg' && token.owner === Address.ZERO.hash) {
                    return 'egg';
                }
                return 'deck';
            }
            if (+token.activeSwap.endingEpoch === epoch) return 'bat';
            return 'shower';
        }
        return 'stands';
    }, [epoch, token]);

    return { token, lifecycle, epoch };
};
