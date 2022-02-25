import { useEffect } from 'react';

import ProtocolState from '@src/state/protocol';
import web3 from '@src/web3';

import WalletState from '.';
export default () => {
    const address = web3.hook.usePriorityAccount();
    const epoch = ProtocolState.select.epoch();
    const chainId = web3.hook.usePriorityChainId();

    useEffect(() => {
        if (address && epoch) {
            WalletState.dispatch.getUserShares({ chainId, address });
        }
    }, [epoch, address, chainId]);
    return null;
};
