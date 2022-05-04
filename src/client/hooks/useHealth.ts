// eslint-disable-next-line import/no-cycle

import React from 'react';

import client from '@src/client';
import { Health } from '@src/client/interfaces';

export const useRpcBackup = () => {
    const { graphProblem } = useHealth();

    return graphProblem;
};

const ok = (abc: Health): abc is Required<Health> => {
    return (
        (!!abc.lastBlockRpc || abc.lastBlockRpc === 0) &&
        (!!abc.lastBlockGraph || abc.lastBlockGraph === 0)
    );
};

export const useHealth = () => {
    const health = client.live.health();

    const blockdiff = React.useMemo(() => {
        return (ok(health) && Math.abs(health.lastBlockGraph - health.lastBlockRpc)) || Number(0);
    }, [health]);

    const graphProblem = React.useMemo(() => {
        if (!ok(health)) return false;

        return blockdiff > 5 && health.lastBlockGraph < health.lastBlockRpc;
    }, [health, blockdiff]);

    return { blockdiff, graphProblem };
};
