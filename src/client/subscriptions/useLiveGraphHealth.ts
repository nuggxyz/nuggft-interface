import { useEffect } from 'react';

import client from '@src/client';
import { HealthDocument, useHealthQuery } from '@src/gql/types.generated';

export default () => {
    const updateProtocolSimple = client.mutate.updateProtocolSimple();
    const { data: healthQueryData } = useHealthQuery({
        query: HealthDocument,
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true,
        pollInterval: 12000,
    });

    useEffect(() => {
        updateProtocolSimple({
            health: {
                lastBlockGraph: healthQueryData?._meta?.block.number ?? null,
            },
        });
    }, [healthQueryData, updateProtocolSimple]);

    return null;
};
