import React, { FunctionComponent } from 'react';

import { useLiveNugg } from '@src/client/hooks/useLiveNugg';
import { useLiveProtocol } from '@src/client/hooks/useLiveProtocol';

type Props = { tokenId: string };

const NextSwap: FunctionComponent<Props> = ({ tokenId }) => {
    const nugg = useLiveNugg((+tokenId + 1).toString());
    const { activeSwaps } = useLiveProtocol();

    return (
        <div>
            {activeSwaps.map((x) => (
                <p>{x}</p>
            ))}
        </div>
    );
};

export default NextSwap;
