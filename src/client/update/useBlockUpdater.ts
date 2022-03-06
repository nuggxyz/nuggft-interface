import React from 'react';

import web3 from '@src/web3';

import client from '..';

export const useBlockUpdater = () => {
    const infura = client.live.infura();
    const chainId = web3.hook.usePriorityChainId();

    React.useEffect(() => {
        if (infura) {
            const go = async () => {
                client.actions.updateBlocknum(await infura.getBlockNumber(), chainId);
            };
            go();
            infura.on('block', (log: number) => {
                client.actions.updateBlocknum(log, chainId);
            });
            return () => {
                infura.off('block', () => undefined);
            };
        }
    }, [infura, chainId]);

    React.useEffect(() => {}, []);
};
