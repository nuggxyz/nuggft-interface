import React, { FunctionComponent, ReactChild, useEffect } from 'react';

import { safeResetLocalStorage } from '@src/lib';
import web3 from '@src/web3';
import client from '@src/client';

import { states } from './store';

type Props = {
    children: ReactChild | ReactChild[];
};

const Initializer: FunctionComponent<Props> = ({ children }) => {
    const active = web3.hook.usePriorityIsActive();

    useEffect(() => {
        safeResetLocalStorage(['walletconnect', 'ens']);
    }, []);

    useEffect(() => {
        void web3.config.connectors.network.connector.activate();
        void web3.config.connectors.metamask.connector.connectEagerly();
        void web3.config.connectors.walletconnect.connector.connectEagerly();
        void client.actions.startActivation();
    }, []);

    return (
        active && (
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
