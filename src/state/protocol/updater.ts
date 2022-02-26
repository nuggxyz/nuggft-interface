import { useCallback, useEffect } from 'react';

import poop from '@src/config';
import web3 from '@src/web3';
import SocketState from '@src/state/socket';

import ProtocolState from './index';
export default () => {
    const genesisBlock = ProtocolState.select.genesisBlock();
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();
    const blockListener = SocketState.select.Block();

    useEffect(() => {
        if (provider && chainId) {
            ProtocolState.dispatch.getGenesisBlock({ provider, chainId });
        }
    }, [chainId, provider]);

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

    const calculateEpochStartBlock = useCallback(
        (epoch: number) => {
            return genesisBlock
                ? Math.floor((epoch - poop.EPOCH_OFFSET) * poop.EPOCH_INTERVAL + genesisBlock)
                : null;
        },
        [genesisBlock],
    );

    useEffect(() => {
        if (blockListener) {
            // const blockToSet = Math.max(currentBlock, newBlock);
            const calculatedEpoch = calculateEpochId(blockListener.block);
            // if (isUndefinedOrNullOrObjectEmpty(epoch) || calculatedEpoch !== +epoch.id) {
            const startBlock = calculateEpochStartBlock(calculatedEpoch);
            const endBlock = calculateEpochStartBlock(calculatedEpoch + 1) - 1;
            if (startBlock && endBlock) {
                ProtocolState.dispatch.safeSetEpoch({
                    epoch: {
                        id: '' + calculatedEpoch,
                        startblock: '' + startBlock,
                        endblock: '' + endBlock,
                    },
                    chainId,
                });
            }
            // }
        }
    }, [blockListener, genesisBlock]);

    useEffect(() => {
        ProtocolState.dispatch.updateStaked({ chainId });
    }, []);

    return null;
};
