import React, { FunctionComponent, ReactChild, useEffect } from 'react';

import web3 from '@src/web3';
import client from '@src/client';
import { Chain } from '@src/web3/core/interfaces';
import { safeResetLocalStorage } from '@src/lib';

import { states } from './store';

type Props = {
    children: ReactChild | ReactChild[];
};

const Initializer: FunctionComponent<Props> = ({ children }) => {
    const active = web3.hook.usePriorityIsActive();
    const provider = web3.hook.usePriorityProvider();

    const chainId = web3.hook.usePriorityChainId();
    const epoch = client.live.epoch.id();
    const graphInstance = client.live.graph();
    const start = client.mutate.start();
    const updateClients = client.mutate.updateClients();

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

    useEffect(() => {
        if (chainId && web3.config.isValidChainId(chainId) && provider) {
            const graph = web3.config.createApolloClient(chainId);

            updateClients({
                graph,
            });

            console.log(graph);

            // setInterval(() => {}, 5000);
            // graph.stop();

            return () => {
                void graph.clearStore();
                graph.stop();

                void updateClients({
                    graph: undefined,
                });
            };
        }
        return () => undefined;
    }, [chainId, updateClients, start, provider]);

    return active && graphInstance ? (
        <>
            {[...Object.values(states), client].map((state, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <state.updater key={`updater-${index}`} />
            ))}
            {epoch && children}
        </>
    ) : null;
};

export default Initializer;
