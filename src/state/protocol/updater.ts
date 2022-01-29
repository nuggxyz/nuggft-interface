import React, { useCallback, useEffect, useState } from 'react';
import { gql, useSubscription } from '@apollo/client';
import { useWeb3React } from '@web3-react/core';
import { BigNumber, ethers } from 'ethers';

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
import NuggftV1Helper from '../../contracts/NuggftV1Helper';
import config from '../../config';
import { StakeEvent } from '../../typechain/NuggftV1';

import ProtocolState from '.';

export default () => {
    const { library } = Web3State.hook.useActiveWeb3React();
    const genesisBlock = ProtocolState.select.genesisBlock();
    const epoch = ProtocolState.select.epoch();
    const chainId = Web3State.select.currentChain();
    const [blocknum, setBlocknum] = useState(0);
    const [lastChainUpdate, setLastChainUpdate] = useState(0);
    const debouncedBlocknum = useDebounce(blocknum, 100);

    useEffect(() => {
        setBlocknum(0);
        ProtocolState.dispatch.getGenesisBlock();
    }, [genesisBlock, chainId]);

    const calculateEpochId = useCallback(
        (blocknum: number) => {
            return genesisBlock
                ? Math.max(
                      Math.floor(
                          (blocknum - genesisBlock) / config.EPOCH_INTERVAL +
                              config.EPOCH_OFFSET,
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
                        ProtocolState.dispatch.safeSetEpoch({
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
        if (
            !isUndefinedOrNullOrObjectEmpty(library) &&
            !isUndefinedOrNullOrNotNumber(genesisBlock)
        ) {
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
    }, [updateBlocknum, library, chainId, genesisBlock]);

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

    useEffect(() => {
        if (!isUndefinedOrNullOrObjectEmpty(library)) {
            ProtocolState.dispatch.updateStaked();

            const update = (log: any) => {
                const event = NuggftV1Helper.instance.interface.parseLog(
                    log,
                ) as unknown as StakeEvent;

                // const protocol = (args.stake as BigNumber)
                //     .shr(96)
                //     .shl(96)
                //     .xor(args.stake);

                const stakedShares = ethers.BigNumber.from(
                    event.args.cache,
                ).shr(96 + 96);

                const stakedEth = ethers.BigNumber.from(event.args.cache)
                    .shr(96)
                    .xor(stakedShares.shl(96));

                ProtocolState.dispatch.setStaked({
                    stakedShares: stakedShares.toString(),
                    stakedEth: stakedEth.toString(),
                });
            };

            const filters = NuggftV1Helper.instance.filters.Stake(null);

            library.on(filters, update);

            return () => {
                library.removeListener(filters, update);
            };
        }
    }, [library]);

    return null;
};
