import { useEffect } from 'react';

import {
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../lib';
import Web3Selectors from '../web3/selectors';
import ProtocolSelectors from '../protocol/selectors';

import NuggDexDispatches from './dispatches';

const NuggDexUpdater = () => {
    const epoch = ProtocolSelectors.epoch();
    const web3address = Web3Selectors.web3address();

    useEffect(() => {
        if (
            !isUndefinedOrNullOrObjectEmpty(epoch) &&
            !isUndefinedOrNullOrStringEmpty(web3address)
        ) {
            NuggDexDispatches.refillRecents({
                _localStorageTarget: 'recents',
            });
            NuggDexDispatches.initNuggDex();
        }
    }, [epoch, web3address]);
    return null;
};

export default NuggDexUpdater;
