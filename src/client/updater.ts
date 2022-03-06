import { useEffect } from 'react';
import React from 'react';
import { gql } from '@apollo/client';
import { BigNumber } from 'ethers';

import web3 from '@src/web3';
import { EthInt, Fraction } from '@src/classes/Fraction';
import { createItemId } from '@src/lib';

import core from './core';
import { useBlockUpdater } from './update/useBlockUpdater';

import client from './index';

export default () => {
    const chainId = web3.hook.usePriorityChainId();

    const apollo = client.live.apollo();
    const infura = client.live.infura();

    useBlockUpdater();

    React.useEffect(() => {
        if (apollo) {
            const instance = apollo
                .subscribe<{
                    protocol: {
                        epoch: {
                            id: string;
                            startBlock: string;
                            endBlock: string;
                            status: 'OVER' | 'ACTIVE' | 'PENDING';
                        };
                        nuggftStakedEth: string;
                        nuggftStakedShares: string;
                        activeNuggs: { id: string; dotnuggRawCache: string }[];
                        activeNuggItems: { item: { id: string; dotnuggRawCache: string } }[];
                    };
                }>({
                    query: gql`
                        subscription useLiveProtocol {
                            protocol(id: "0x42069") {
                                epoch {
                                    id
                                    status
                                    startblock
                                    endblock
                                }
                                nuggftStakedEth
                                nuggftStakedShares
                                activeNuggs(orderBy: idnum) {
                                    id
                                    dotnuggRawCache
                                }
                                activeNuggItems {
                                    item {
                                        id
                                        dotnuggRawCache
                                    }
                                }
                            }
                        }
                    `,
                    variables: {},
                })
                .subscribe((x) => {
                    const shares = BigNumber.from(x.data.protocol.nuggftStakedShares);

                    const staked = BigNumber.from(x.data.protocol.nuggftStakedEth);

                    client.actions.updateProtocol({
                        stake: {
                            staked,
                            shares,
                            eps: EthInt.fromFraction(new Fraction(staked, shares)),
                        },
                        epoch: {
                            id: +x.data.protocol.epoch.id,
                            startblock: +x.data.protocol.epoch.startBlock,
                            endblock: +x.data.protocol.epoch.endBlock,
                            status: x.data.protocol.epoch.status,
                        },
                        activeSwaps: x.data.protocol.activeNuggs.map((x) => {
                            return { id: x.id, dotnuggRawCache: x.dotnuggRawCache };
                        }),
                        activeItems: x.data.protocol.activeNuggItems.map((x) => {
                            return {
                                id: createItemId(x.item.id),
                                dotnuggRawCache: x.item.dotnuggRawCache,
                            };
                        }),
                    });
                });
            return () => {
                instance.unsubscribe();
            };
        }
    }, [apollo]);

    useEffect(() => {
        if (chainId && web3.config.isValidChainId(chainId)) {
            const apollo = web3.config.createApolloClient(chainId);
            const infura = web3.config.createInfuraWebSocket(chainId);

            core.actions.updateProtocol({
                apollo,
                infura,
            });

            return () => {
                infura.removeAllListeners();
                infura.destroy();

                apollo.stop();

                core.actions.updateProtocol({
                    apollo: undefined,
                    infura: undefined,
                });
            };
        }
    }, [chainId]);

    return null;
};
