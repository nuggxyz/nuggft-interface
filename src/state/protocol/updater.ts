import { useCallback, useEffect } from 'react';
import { BigNumber, BigNumberish } from 'ethers';

import poop from '@src/config';
import web3 from '@src/web3';
import SocketState from '@src/state/socket';
import { isUndefinedOrNullOrNotBigNumber, isUndefinedOrNullOrNotNumber } from '@src/lib';

import ProtocolState from './index';
export default () => {
    // const genesisBlock = ProtocolState.select.genesisBlock();
    // const interval = ProtocolState.select.interval();
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();
    const blockListener = SocketState.select.Block();

    useEffect(() => {
        if (provider && chainId) {
            ProtocolState.dispatch.getGenesisBlock({ provider, chainId });
            ProtocolState.dispatch.getInterval({ chainId });
        }
    }, [chainId, provider]);

    const calculateEpochId = useCallback((blocknum: number) => {
        if (!isUndefinedOrNullOrNotNumber(blocknum)) {
            return BigNumber.from(blocknum)
                .sub(web3.config.CONTRACTS[chainId].Genesis)
                .div(web3.config.CONTRACTS[chainId].Interval)
                .add(poop.EPOCH_OFFSET);
        }
    }, []);

    const calculateEpochStartBlock = useCallback((epoch: BigNumberish) => {
        return BigNumber.from(epoch)
            .sub(poop.EPOCH_OFFSET)
            .mul(web3.config.CONTRACTS[chainId].Interval)
            .add(web3.config.CONTRACTS[chainId].Genesis);
    }, []);

    useEffect(() => {
        if (blockListener) {
            const calculatedEpoch = calculateEpochId(blockListener.block);
            if (!isUndefinedOrNullOrNotBigNumber(calculatedEpoch)) {
                const startBlock = calculateEpochStartBlock(calculatedEpoch);
                const endBlock = calculateEpochStartBlock(calculatedEpoch.add(1)).sub(1);
                if (startBlock && endBlock) {
                    ProtocolState.dispatch.safeSetEpoch({
                        epoch: {
                            id: calculatedEpoch.toString(),
                            startblock: startBlock.toString(),
                            endblock: endBlock.toString(),
                        },
                        chainId,
                    });
                }
            }
        }
    }, [blockListener, chainId]);

    useEffect(() => {
        ProtocolState.dispatch.updateStaked({ chainId });
    }, []);

    return null;
};
