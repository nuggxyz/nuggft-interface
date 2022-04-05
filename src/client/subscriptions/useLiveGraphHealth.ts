import { useEffect } from 'react';

import client from '@src/client';
import { HealthDocument, useHealthQuery } from '@src/gql/types.generated';

export default () => {
    const graph = client.live.graph();

    const updateProtocol = client.mutate.updateProtocol();
    const { data: healthQueryData } = useHealthQuery({
        client: graph,
        query: HealthDocument,
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true,
        pollInterval: 12000,
    });

    useEffect(() => {
        updateProtocol({
            health: {
                lastBlockGraph: healthQueryData?._meta?.block.number ?? null,
            },
        });
    }, [healthQueryData, updateProtocol]);

    return null;
};
