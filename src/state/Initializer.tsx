import React, { FunctionComponent, ReactChild, useEffect } from 'react';

import { safeResetLocalStorage } from '../lib';

import { states } from './store';

type Props = {
    children: ReactChild | ReactChild[];
};

const Initializer: FunctionComponent<Props> = ({ children }) => {
    useEffect(() => {
        safeResetLocalStorage(['walletconnect', 'ens']);
    }, []);
    return (
        <>
            {Object.values(states).map((state, index) => (
                <state.updater key={index} />
            ))}
            {children}
        </>
    );
};

export default Initializer;
