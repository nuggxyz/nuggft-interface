/* eslint-disable import/no-cycle */
import React from 'react';

import { LiveToken } from '@src/client/interfaces';
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
                updateToken(tokenId, { ...token });
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
