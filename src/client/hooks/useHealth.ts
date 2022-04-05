// eslint-disable-next-line import/no-cycle

import React from 'react';

import client from '@src/client';
import useRecursiveTimeout from '@src/hooks/useRecursiveTimeout';
import { Health } from '@src/client/interfaces';

export const useRpcBackup = () => {
    const { blockdiff } = useHealth();

    console.log({ blockdiff });
    return blockdiff > 5;
};

const ok = (abc: Health): abc is Required<Health> => {
    return (
        (!!abc.lastBlockRpc || abc.lastBlockRpc === 0) &&
        (!!abc.lastBlockGraph || abc.lastBlockGraph === 0)
    );
};

export const useHealth = () => {
    const health = client.live.health();

    const [blockdiff, setBlockDiff] = React.useState(0);

    useRecursiveTimeout(
        React.useCallback(() => {
            setBlockDiff(
                (ok(health) && Math.abs(health.lastBlockGraph - health.lastBlockRpc)) || Number(0),
            );
        }, [health]),
        5000,
    );

    const graphProblem = React.useMemo(() => {
        if (!ok(health)) return false;

        return blockdiff > 5 && health.lastBlockGraph < health.lastBlockRpc;
    }, [health, blockdiff]);

    return { blockdiff, graphProblem };
};
