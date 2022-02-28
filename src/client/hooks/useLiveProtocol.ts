import { gql } from '@apollo/client';
import { BigNumber } from '@ethersproject/bignumber';
import React from 'react';

import { EthInt, Fraction } from '@src/classes/Fraction';

import client from '..';

const query = gql`
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
            activeNuggs {
                id
            }
        }
    }
`;

type Stake = {
    staked: BigNumber;
    shares: BigNumber;
    eps: EthInt;
};

type Epoch = {
    startBlock: number;
    endBlock: number;
    id: number;
    status: 'OVER' | 'ACTIVE' | 'PENDING';
};

type Swap = {};

export const useLiveProtocol = () => {
    const apollo = client.live.apollo();

    // const [stake, setStake] = React.useState<Stake>(undefined);
    // const [epoch, setEpoch] = React.useState<Epoch>(undefined);
    // const [activeNuggs, setActiveNuggs] = React.useState<string[]>([]);

    const stake = client.live.stake();
    const epoch = client.live.epoch();
    const activeSwaps = client.live.activeSwaps();

    // const call = React.useCallback(
    //     (_stake: Stake, _epoch: Epoch, _activeNuggs: string[]) => {
    //         if (!stake || stake.eps.lt(_stake.eps)) setStake(_stake);
    //         if (!epoch || epoch.id < _epoch.id || epoch.status !== _epoch.status) setEpoch(_epoch);
    //         setActiveNuggs(_activeNuggs);
    //     },
    //     [stake, epoch],
    // );

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
                        activeNuggs: { id: string }[];
                    };
                }>({ query: query, variables: {} })
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
                            startBlock: +x.data.protocol.epoch.startBlock,
                            endBlock: +x.data.protocol.epoch.endBlock,
                            status: x.data.protocol.epoch.status,
                        },
                        activeSwaps: x.data.protocol.activeNuggs.map((x) => x.id),
                    });
                });
            return () => {
                instance.unsubscribe();
            };
        }
    }, [apollo]);

    return { stake, epoch, activeSwaps };
};
