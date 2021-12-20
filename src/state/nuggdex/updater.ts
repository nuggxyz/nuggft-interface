import { useEffect } from 'react';

import {
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../lib';
import ProtocolState from '../protocol';
import Web3Selectors from '../web3/selectors';

import NuggDexState from '.';

export default () => {
    const epoch = ProtocolState.select.epoch();
    const web3address = Web3Selectors.web3address();

    useEffect(() => {
        if (
            !isUndefinedOrNullOrObjectEmpty(epoch) &&
            !isUndefinedOrNullOrStringEmpty(web3address)
        ) {
            NuggDexState.dispatch.refillRecents({
                _localStorageTarget: 'recents',
            });
            NuggDexState.dispatch.initNuggDex();
        }
    }, [epoch, web3address]);
    return null;
};
