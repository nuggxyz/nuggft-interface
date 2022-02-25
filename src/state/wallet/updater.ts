import { useEffect } from 'react';

import ProtocolState from '../protocol';
import config from '../web32/config';

import WalletState from '.';

export default () => {
    const address = config.priority.usePriorityAccount();
    const epoch = ProtocolState.select.epoch();
    const chainId = config.priority.usePriorityChainId();

    useEffect(() => {
        if (address && epoch) {
            WalletState.dispatch.getUserShares({ chainId, address });
        }
    }, [epoch, address, chainId]);
    return null;
};
