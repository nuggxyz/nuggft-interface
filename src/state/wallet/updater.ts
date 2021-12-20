import { useEffect } from 'react';

import ProtocolSelectors from '../protocol/selectors';
import Web3Selectors from '../web3/selectors';

import WalletDispatches from './dispatches';

const WalletUpdater = () => {
    const web3address = Web3Selectors.web3address();
    const epoch = ProtocolSelectors.epoch();

    useEffect(() => {
        if (web3address && epoch) {
            WalletDispatches.getUnclaimedOffers();
            WalletDispatches.getHistory({});
            WalletDispatches.getUserShares();
        }
    }, [epoch, web3address]);
    return null;
};

export default WalletUpdater;
