import React, { FunctionComponent, ReactChild, useEffect } from 'react';

import web3 from '@src/web3';
import { Chain } from '@src/web3/core/interfaces';
import { safeResetLocalStorage } from '@src/lib';
import ClientUpdater from '@src/client/ClientUpdater';

import { states } from './store';

type Props = {
    children: ReactChild | ReactChild[];
};

const Initializer: FunctionComponent<Props> = ({ children }) => {
    const active = web3.hook.usePriorityIsActive();
    // const epoch = client.live.epoch.id();
    // const graphInstance = client.live.graph();

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

    return (
        <>
            <ClientUpdater />

            {[...Object.values(states)].map((state, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <state.updater key={`updater-${index}`} />
            ))}

            {active && children}
        </>
    );
};

export default Initializer;
