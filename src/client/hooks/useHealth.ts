// eslint-disable-next-line import/no-cycle
import { useMemo } from 'react';

import client from '@src/client';

export const useRpcBackup = () => {
    const { blockdiff } = useHealth();
    return blockdiff > 5;
};

export const useHealth = () => {
    const health = client.live.health();

    const blockdiff = useMemo(() => {
        return (
            ((health.lastBlockRpc || health.lastBlockRpc === 0) &&
                (health.lastBlockGraph || health.lastBlockGraph === 0) &&
                Math.abs(health.lastBlockGraph - health.lastBlockRpc)) ||
            Number(0)
        );
    }, [health]);

    return { blockdiff };
};
