import { useEffect } from 'react';

import client from '@src/client';
import { HealthDocument, useHealthQuery } from '@src/gql/types.generated';

export default () => {
    const useUpdateLastBlockGraph = client.health.useUpdateLastBlockGraph();

    const { data: healthQueryData } = useHealthQuery({
        query: HealthDocument,
        fetchPolicy: 'no-cache',
        notifyOnNetworkStatusChange: true,
        pollInterval: 12000,
    });

    useEffect(() => {
        if (healthQueryData?._meta?.block.number)
            useUpdateLastBlockGraph(healthQueryData?._meta?.block.number);
    }, [healthQueryData, useUpdateLastBlockGraph]);

    return null;
};
