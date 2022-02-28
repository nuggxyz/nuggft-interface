import { useEffect } from 'react';

import web3 from '@src/web3';

import client from './index';

export default () => {
    const chainId = web3.hook.usePriorityChainId();

    useEffect(() => {
        if (chainId && web3.config.isValidChainId(chainId)) {
            const apollo = web3.config.createApolloClient(chainId);
            const infura = web3.config.createInfuraWebSocket(chainId);

            client.core.actions.update({
                apollo,
                infura,
            });

            return () => {
                infura.removeAllListeners();
                infura.destroy();

                apollo.stop();

                client.core.actions.update({
                    apollo: undefined,
                    infura: undefined,
                });
            };
        }
    }, [chainId]);

    return null;
};
