import React, { FunctionComponent, ReactChild, useEffect } from 'react';

import { safeResetLocalStorage } from '@src/lib';
import web3 from '@src/web3';
import client from '@src/client';
import { Chain } from '@src/web3/core/interfaces';
// eslint-disable-next-line import/no-named-as-default
import core from '@src/client/core';

import { states } from './store';

type Props = {
    children: ReactChild | ReactChild[];
};

const Initializer: FunctionComponent<Props> = ({ children }) => {
    const active = web3.hook.useNetworkIsActive();
    const chainId = web3.hook.usePriorityChainId();
    const epoch = client.live.epoch.id();
    const graph = client.live.apollo();

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

        const { infura } = web3.config.connector_instances;

        if (infura !== undefined && infura.connector && infura.connector.activate)
            void infura.connector.activate(Chain.RINKEBY);

        void client.actions.startActivation();
    }, []);

    useEffect(() => {
        if (chainId && web3.config.isValidChainId(chainId)) {
            const apollo = web3.config.createApolloClient(chainId);
            const infura = web3.config.createAlchemyWebSocket(chainId);

            void core.actions.updateClients(
                {
                    apollo,
                    infura,
                },
                chainId,
            );

            return () => {
                infura.removeAllListeners();
                void infura.destroy();

                apollo.stop();

                void core.actions.updateClients(
                    {
                        apollo: undefined,
                        infura: undefined,
                    },
                    chainId,
                );
            };
        }
        return () => undefined;
    }, [chainId]);

    return active && graph ? (
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
