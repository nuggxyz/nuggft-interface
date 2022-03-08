import React, { FunctionComponent, ReactChild, useEffect } from 'react';

import { safeResetLocalStorage } from '@src/lib';
import web3 from '@src/web3';
import client from '@src/client';
import { Chain } from '@src/web3/core/interfaces';
import core from '@src/client/core';

import { states } from './store';

type Props = {
    children: ReactChild | ReactChild[];
};

const Initializer: FunctionComponent<Props> = ({ children }) => {
    const active = web3.hook.usePriorityIsActive();
    const chainId = web3.hook.usePriorityChainId();
    const epochId = client.live.epoch__id();

    useEffect(() => {
        safeResetLocalStorage(['walletconnect', 'ens']);
    }, []);

    useEffect(() => {
        void web3.config.connector_instances.metamask?.connector.connectEagerly(Chain.RINKEBY);

        void web3.config.connector_instances.walletconnect.connector.connectEagerly(Chain.RINKEBY);
        void web3.config.connector_instances.walletlink.connector.connectEagerly(Chain.RINKEBY);

        void web3.config.connector_instances.infura.connector.activate(Chain.RINKEBY);

        void client.actions.startActivation();
    }, []);

    useEffect(() => {
        if (chainId && web3.config.isValidChainId(chainId)) {
            const apollo = web3.config.createApolloClient(chainId);
            const infura = web3.config.createInfuraWebSocket(chainId);

            core.actions.updateClients(
                {
                    apollo,
                    infura,
                },
                chainId,
            );

            return () => {
                infura.removeAllListeners();
                infura.destroy();

                apollo.stop();

                core.actions.updateClients(
                    {
                        apollo: undefined,
                        infura: undefined,
                    },
                    chainId,
                );
            };
        }
    }, [chainId]);

    return (
        active &&
        epochId && (
            <>
                {[...Object.values(states), client].map((state, index) => (
                    <state.updater key={index} />
                ))}
                {children}
            </>
        )
    );
};

export default Initializer;
