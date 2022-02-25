import React, { FunctionComponent, ReactChild, useEffect } from 'react';

import { safeResetLocalStorage } from '../lib';

import { states } from './store';
import config from './web32/config';

type Props = {
    children: ReactChild | ReactChild[];
};

const Initializer: FunctionComponent<Props> = ({ children }) => {
    const active = config.priority.usePriorityIsActive();

    useEffect(() => {
        safeResetLocalStorage(['walletconnect', 'ens']);
    }, []);

    useEffect(() => {
        void config.connectors.network.connector.activate();
        void config.connectors.metamask.connector.connectEagerly();
        void config.connectors.walletconnect.connector.connectEagerly();
    }, []);

    return (
        active && (
            <>
                {Object.values(states).map((state, index) => (
                    <state.updater key={index} />
                ))}
                {children}
            </>
        )
    );
};

export default Initializer;
