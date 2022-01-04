import React, { useCallback, useEffect, useState } from 'react';
import { gql, useSubscription } from '@apollo/client';

import useRecursiveTimeout from '../../hooks/useRecursiveTimeout';
import {
    isUndefinedOrNullOrNotNumber,
    isUndefinedOrNullOrNotString,
    isUndefinedOrNullOrNumberZero,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../lib';
import constants from '../../lib/constants';
import { _metaBare } from '../../graphql/fragments/_meta';
import { client } from '../../graphql/client';
import Web3State from '../web3';
import useDebounce from '../../hooks/useDebounce';
import Web3Config from '../web3/Web3Config';
import NuggFTHelper from '../../contracts/NuggFTHelper';
import config from '../../config';

import ProtocolState from '.';

export default () => {
    // const block = ProtocolState.select.currentBlock();
    // const epoch = ProtocolState.select.epoch();

    // const checkEpoch = useCallback(() => {
    //     if (
    //         isUndefinedOrNullOrObjectEmpty(epoch) ||
    //         (!isUndefinedOrNullOrNumberZero(block) && block >= +epoch.endblock)
    //     ) {
    //         ProtocolState.dispatch.updateEpoch();
    //         // ProtocolState.dispatch.updateStaked();
    //     }
    // }, [epoch, block]);

    // const { data } = useSubscription(
    //     gql`
    //         subscription Cool {
    //             _meta {
    //                 block {
    //                     number
    //                 }
    //             }
    //         }
    //     `,
    //     { client },
    // );

    // useEffect(() => {
    //     if (data && data._meta && data._meta.block && data._meta.block.number) {
    //         ProtocolState.dispatch.setCurrentBlock(data._meta.block.number);
    //         console.log('blocknum');
    //         checkEpoch();
    //     }
    // }, [data]);

    // useRecursiveTimeout(() => {
    //     checkEpoch();
    //     ProtocolState.dispatch.updateBlock();
    // }, constants.QUERYTIME);

    // TODO DELETE THIS SHIT ABOVE

    const { library } = Web3State.hook.useActiveWeb3React();
    const genesisBlock = ProtocolState.select.genesisBlock();
    const epoch = ProtocolState.select.epoch();

    useEffect(() => {
        if (isUndefinedOrNullOrNotNumber(genesisBlock)) {
            NuggFTHelper.instance
                .connect(Web3State.getLibraryOrProvider())
                .genesis()
                .then((genesis) => {
                    ProtocolState.dispatch.setGenesisBlock(genesis.toNumber());
                })
                .catch(() =>
                    ProtocolState.dispatch.setGenesisBlock(
                        genesisBlock === undefined ? null : undefined,
                    ),
                );
        }
    }, [genesisBlock]);

    const [blocknum, setBlocknum] = useState(0);
    const [lastChainUpdate, setLastChainUpdate] = useState(0);

    const debouncedBlocknum = useDebounce(blocknum, 100);

    const calculateEpochId = useCallback(
        (blocknum: number) => {
            return genesisBlock
                ? Math.floor(
                      (blocknum - genesisBlock) / config.EPOCH_INTERVAL +
                          config.EPOCH_OFFSET,
                  )
                : null;
        },
        [genesisBlock],
    );

    const calculateEpochStartBlock = useCallback(
        (epoch: number) => {
            return genesisBlock
                ? Math.floor(
                      (epoch - config.EPOCH_OFFSET) * config.EPOCH_INTERVAL +
                          genesisBlock,
                  )
                : null;
        },
        [genesisBlock],
    );

    const updateBlocknum = useCallback(
        (newBlock: number) =>
            setBlocknum((currentBlock) => {
                const blockToSet = Math.max(currentBlock, newBlock);
                const calculatedEpoch = calculateEpochId(blockToSet);
                if (
                    isUndefinedOrNullOrObjectEmpty(epoch) ||
                    calculatedEpoch !== +epoch.id
                ) {
                    const startBlock =
                        calculateEpochStartBlock(calculatedEpoch);
                    const endBlock =
                        calculateEpochStartBlock(calculatedEpoch + 1) - 1;
                    if (startBlock && endBlock) {
                        ProtocolState.dispatch.setEpoch({
                            id: '' + calculatedEpoch,
                            startblock: '' + startBlock,
                            endblock: '' + endBlock,
                        });
                    }
                }
                return blockToSet;
            }),
        [epoch, calculateEpochStartBlock, calculateEpochId],
    );

    useEffect(() => {
        if (!isUndefinedOrNullOrObjectEmpty(library)) {
            library
                .getBlockNumber()
                .then(updateBlocknum)
                .catch((error) =>
                    console.error('Failed to get block number', error),
                );

            library.on('block', updateBlocknum);
            return () => {
                library.removeListener('block', updateBlocknum);
            };
        }
    }, [updateBlocknum, library]);

    useEffect(() => {
        if (!isUndefinedOrNullOrNotNumber(debouncedBlocknum)) {
            ProtocolState.dispatch.setCurrentBlock(debouncedBlocknum);
            setLastChainUpdate(0);
        }
    }, [debouncedBlocknum]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setLastChainUpdate(
                (lastUpdate) => Web3Config.NETWORK_HEALTH_CHECK_MS + lastUpdate,
            );
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

    return null;
};
