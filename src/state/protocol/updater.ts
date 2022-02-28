import { useCallback, useEffect } from 'react';
import { BigNumber, BigNumberish } from 'ethers';

import poop from '@src/config';
import web3 from '@src/web3';
import SocketState from '@src/state/socket';
import { isUndefinedOrNullOrNotBigNumber, isUndefinedOrNullOrNotNumber } from '@src/lib';

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
            if (!isUndefinedOrNullOrNotNumber(blocknum)) {
                return genesisBlock
                    ? BigNumber.from(blocknum)
                          .sub(genesisBlock)
                          .div(poop.EPOCH_INTERVAL)
                          .add(poop.EPOCH_OFFSET)
                    : null;
            }
        },
        [genesisBlock],
    );

    const calculateEpochStartBlock = useCallback(
        (epoch: BigNumberish) => {
            return genesisBlock
                ? BigNumber.from(epoch)
                      .sub(poop.EPOCH_OFFSET)
                      .mul(poop.EPOCH_INTERVAL)
                      .add(genesisBlock)
                : null;
        },
        [genesisBlock],
    );

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
    }, [blockListener, genesisBlock]);

    useEffect(() => {
        ProtocolState.dispatch.updateStaked({ chainId });
    }, []);

    return null;
};
