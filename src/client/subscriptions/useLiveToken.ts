/* eslint-disable import/no-cycle */

import { TokenId } from '@src/client/router';

import useLiveItem from './useLiveItem';
import useLiveNugg from './useLiveNugg';

export default (tokenId: TokenId | undefined) => {
    useLiveItem(tokenId);
    useLiveNugg(tokenId);
    return null;
};
