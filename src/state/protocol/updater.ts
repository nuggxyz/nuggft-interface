import { useCallback, useEffect, useState } from 'react';

import { isUndefinedOrNullOrNotNumber } from '../../lib';
import Web3State from '../web3';
import useDebounce from '../../hooks/useDebounce';
import Web3Config from '../web3/Web3Config';
import poop from '../../config';
import config from '../web32/config';

import ProtocolState from '.';

export default () => {
    const genesisBlock = ProtocolState.select.genesisBlock();
    const epoch = ProtocolState.select.epoch();
    const chainId = config.priority.usePriorityChainId();
    const [blocknum, setBlocknum] = useState(0);
    const [lastChainUpdate, setLastChainUpdate] = useState(0);
    const debouncedBlocknum = useDebounce(blocknum, 10);

    useEffect(() => {
        setBlocknum(0);
        ProtocolState.dispatch.getGenesisBlock();
    }, [genesisBlock, chainId]);

    const calculateEpochId = useCallback(
        (blocknum: number) => {
            return genesisBlock
                ? Math.max(
                      Math.floor(
                          (blocknum - genesisBlock) / poop.EPOCH_INTERVAL + poop.EPOCH_OFFSET,
                      ),
                      0,
                  )
                : null;
        },
        [genesisBlock],
    );

    useEffect(() => {
        if (!isUndefinedOrNullOrNotNumber(debouncedBlocknum)) {
            ProtocolState.dispatch.setCurrentBlock(debouncedBlocknum);
            setLastChainUpdate(0);
        }
    }, [debouncedBlocknum]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setLastChainUpdate((lastUpdate) => Web3Config.NETWORK_HEALTH_CHECK_MS + lastUpdate);
            if (lastChainUpdate > Web3Config.DEFAULT_MS_BEFORE_WARNING) {
                Web3State.dispatch.setConnectivityWarning(true);
            } else {
                Web3State.dispatch.setConnectivityWarning(false);
            }
        }, Web3Config.NETWORK_HEALTH_CHECK_MS);

        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
        };
    }, [lastChainUpdate, setLastChainUpdate]);

    useEffect(() => {
        ProtocolState.dispatch.updateStaked({ chainId });
    }, []);

    return null;
};
