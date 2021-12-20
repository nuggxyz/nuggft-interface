import { useEffect } from 'react';

import {
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../lib';
import Web3Selectors from '../web3/selectors';
import ProtocolSelectors from '../protocol/selectors';

import NuggDexState from '.';

export default () => {
    const epoch = ProtocolSelectors.epoch();
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
