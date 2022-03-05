import constants, { ITEM_ID } from '@src/lib/constants';

import { LiveItem, useLiveItem } from './useLiveItem';
import { LiveNugg, useLiveNugg } from './useLiveNugg';

export const useLiveToken = (tokenId: string | ITEM_ID): LiveNugg | LiveItem => {
    if (tokenId && tokenId.startsWith(constants.ID_PREFIX_ITEM)) {
        return useLiveItem(tokenId);
    } else {
        return useLiveNugg(tokenId);
    }
};
