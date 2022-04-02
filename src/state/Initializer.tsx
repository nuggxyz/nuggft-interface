import React, { FunctionComponent, ReactChild } from 'react';

import { states } from './store';

type Props = {
    children: ReactChild | ReactChild[];
};

const Initializer: FunctionComponent<Props> = ({ children }) => {
    return (
        <>
            {[...Object.values(states)].map((state, index) => (
                <state.updater key={`updater-${index}`} />
            ))}

            {children}
        </>
    );
};

export default Initializer;
