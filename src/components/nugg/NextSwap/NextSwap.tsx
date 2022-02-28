import React, { FunctionComponent } from 'react';

import client from '@src/client';

type Props = { tokenId: string };

const NextSwap: FunctionComponent<Props> = ({ tokenId }) => {
    const activeSwaps = client.live.activeSwaps();

    const [activeTokenId, setActiveTokenId] = React.useState<string>();

    const nugg = client.hook.useLiveNugg(activeTokenId);

    React.useEffect(() => {
        if (activeSwaps.includes((+tokenId + 1).toString())) {
            setActiveTokenId((+tokenId + 1).toString());
        }
    }, [activeSwaps]);

    return (
        <div>
            {/* {activeSwaps.map((x) => (
                <p>{x}</p>
            ))} */}
            <div>
                {nugg && activeTokenId ? (
                    <p> swap for nugg {activeTokenId} starting soon </p>
                ) : (
                    <p> next swap not ready </p>
                )}
            </div>
        </div>
    );
};

export default NextSwap;
