import { gql } from '@apollo/client';
import React from 'react';

import client from '..';

const query = gql`
    subscription useLiveEpoch($epochId: ID!) {
        epoch(id: $epochId) {
            id
            status
            startBlock
            endBlock
        }
    }
`;

type Epoch = {
    startBlock: number;
    endBlock: number;
    id: number;
    status: 'OVER' | 'ACTIVE' | 'PENDING';
};

export const useLiveEpoch = (epochId: string) => {
    const apollo = client.useApollo();

    const [epoch, setEpoch] = React.useState<Epoch>(undefined);

    const call = React.useCallback(
        (_epoch: Epoch) => {
            if (epoch.status !== _epoch.status) setEpoch(_epoch);
        },
        [epoch],
    );

    React.useEffect(() => {
        if (apollo) {
            const instance = apollo
                .subscribe<{
                    epoch: {
                        id: string;
                        startBlock: string;
                        endBlock: string;
                        status: 'OVER' | 'ACTIVE' | 'PENDING';
                    };
                }>({ query: query, variables: {} })
                .subscribe((x) => {
                    call({
                        id: +x.data.epoch.id,
                        startBlock: +x.data.epoch.startBlock,
                        endBlock: +x.data.epoch.endBlock,
                        status: x.data.epoch.status,
                    });
                });
            return () => {
                instance.unsubscribe();
            };
        }
    }, [apollo]);

    return epoch;
};
