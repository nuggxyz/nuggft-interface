import { useEffect } from 'react';

import ProtocolState from '../protocol';
import Web3Selectors from '../web3/selectors';

import WalletState from '.';

export default () => {
    const web3address = Web3Selectors().web3address();
    const epoch = ProtocolState.select.epoch();

    useEffect(() => {
        if (web3address && epoch) {
            WalletState.dispatch.getUnclaimedOffers();
            WalletState.dispatch.getHistory({});
            WalletState.dispatch.getUserShares();
        }
    }, [epoch, web3address]);
    return null;
};
