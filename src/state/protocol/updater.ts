import { useCallback, useEffect, useState } from 'react';

import { isUndefinedOrNullOrObjectEmpty } from '@src/lib';
import poop from '@src/config';
import web3 from '@src/web3';

import ProtocolState from '.';
export default () => {
    const genesisBlock = ProtocolState.select.genesisBlock();
    const epoch = ProtocolState.select.epoch();
    const chainId = web3.hook.usePriorityChainId();
    // const [blocknum, setBlocknum] = useState(0);
    const [lastChainUpdate, setLastChainUpdate] = useState(0);
    // const debouncedBlocknum = useDebounce(blocknum, 10);
    const provider = web3.hook.usePriorityProvider();
    const blocknum = ProtocolState.select.currentBlock();

    const getBlock = useCallback(
        (epoch: number) => {
            return genesisBlock
                ? Math.floor((epoch - poop.EPOCH_OFFSET) * poop.EPOCH_INTERVAL + genesisBlock)
                : null;
        },
        [genesisBlock],
    );

    useEffect(() => {
        // setBlocknum(0);
        // console.log({ provider, chainId });
        if (provider && chainId) {
            ProtocolState.dispatch.getGenesisBlock({ provider, chainId });
            async function getit() {
                ProtocolState.dispatch.setCurrentBlock(await provider.getBlockNumber());
            }
            getit();
        }
    }, [genesisBlock, chainId, provider]);

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

    // const updateBlocknum = useCallback(
    //     (newBlock: number) =>
    //         setBlocknum((currentBlock) => {
    //             const blockToSet = Math.max(currentBlock, newBlock);
    //             const calculatedEpoch = calculateEpochId(blockToSet);
    //             if (isUndefinedOrNullOrObjectEmpty(epoch) || calculatedEpoch !== +epoch.id) {
    //                 const startBlock = calculateEpochStartBlock(calculatedEpoch);
    //                 const endBlock = calculateEpochStartBlock(calculatedEpoch + 1) - 1;
    //                 if (startBlock && endBlock) {
    //                     ProtocolState.dispatch.safeSetEpoch({
    //                         epoch: {
    //                             id: '' + calculatedEpoch,
    //                             startblock: '' + startBlock,
    //                             endblock: '' + endBlock,
    //                         },
    //                         chainId,
    //                     });
    //                 }
    //             }
    //             return blockToSet;
    //         }),
    //     [epoch, calculateEpochStartBlock, calculateEpochId, chainId],
    // );

    // useEffect(() => {
    //     if (!isUndefinedOrNullOrNotNumber(debouncedBlocknum)) {
    //         ProtocolState.dispatch.setCurrentBlock(debouncedBlocknum);
    //         setLastChainUpdate(0);
    //     }
    // }, [debouncedBlocknum]);

    useEffect(() => {
        // const blockToSet = Math.max(currentBlock, newBlock);
        const calculatedEpoch = calculateEpochId(blocknum);
        if (isUndefinedOrNullOrObjectEmpty(epoch) || calculatedEpoch !== +epoch.id) {
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
        }
    }, [blocknum, epoch, calculateEpochStartBlock, calculateEpochId, chainId]);

    // useEffect(() => {
    //     const timeout = setTimeout(() => {
    //         setLastChainUpdate((lastUpdate) => config.NETWORK_HEALTH_CHECK_MS + lastUpdate);
    //         if (lastChainUpdate > config.DEFAULT_MS_BEFORE_WARNING) {
    //             Web3State.dispatch.setConnectivityWarning(true);
    //         } else {
    //             Web3State.dispatch.setConnectivityWarning(false);
    //         }
    //     }, config.NETWORK_HEALTH_CHECK_MS);

    //     return () => {
    //         if (timeout) {
    //             clearTimeout(timeout);
    //         }
    //     };
    // }, [lastChainUpdate, setLastChainUpdate]);

    useEffect(() => {
        ProtocolState.dispatch.updateStaked({ chainId });
    }, []);

    return null;
};
