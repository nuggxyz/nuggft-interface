import { useEffect } from 'react';

import Web3State from '../web3';
import ProtocolState from '../protocol';

import WalletState from '.';

export default () => {
    const web3address = Web3State.select.web3address();
    const epoch = ProtocolState.select.epoch();
    const chain = Web3State.select.currentChain();

    useEffect(() => {
        if (web3address && epoch) {
            WalletState.dispatch.getUserShares();
        }
    }, [epoch, web3address, chain]);
    return null;
};
