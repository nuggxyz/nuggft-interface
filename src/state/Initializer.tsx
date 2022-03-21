import React, { FunctionComponent, ReactChild, useEffect } from 'react';

import { safeResetLocalStorage } from '@src/lib';
import web3 from '@src/web3';
import client from '@src/client';
import { Chain } from '@src/web3/core/interfaces';
// eslint-disable-next-line import/no-named-as-default

import { states } from './store';

type Props = {
    children: ReactChild | ReactChild[];
};

const Initializer: FunctionComponent<Props> = ({ children }) => {
    const active = web3.hook.useNetworkIsActive();
    const chainId = web3.hook.usePriorityChainId();
    const epoch = client.live.epoch.id();
    const graphInstance = client.live.graph();

    useEffect(() => {
        safeResetLocalStorage(['walletconnect', 'ens']);
    }, []);

    useEffect(() => {
        [
            web3.config.connector_instances.metamask,
            web3.config.connector_instances.walletconnect,
            web3.config.connector_instances.walletlink,
        ].forEach((x) => {
            if (x !== undefined && x.connector && x.connector.connectEagerly)
                void x.connector.connectEagerly(Chain.RINKEBY);
        });

        const { rpc } = web3.config.connector_instances;

        if (rpc !== undefined && rpc.connector && rpc.connector.activate)
            void rpc.connector.activate(Chain.RINKEBY);
    }, []);

    const updateClients = client.mutate.updateClients();

    useEffect(() => {
        if (chainId && web3.config.isValidChainId(chainId)) {
            const graph = web3.config.createApolloClient(chainId);
            const rpc = web3.config.createInfuraWebSocket(chainId);

            void updateClients(
                {
                    graph,
                    rpc,
                },
                chainId,
            );

            return () => {
                rpc.removeAllListeners();
                void rpc.destroy();

                graph.stop();

                void updateClients(
                    {
                        graph: undefined,
                        rpc: undefined,
                    },
                    chainId,
                );
            };
        }
        return () => undefined;
    }, [chainId]);

    return active && graphInstance ? (
        <>
            {[...Object.values(states), client].map((state, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <state.updater key={index} />
            ))}
            {epoch && children}
        </>
    ) : null;
};

export default Initializer;
