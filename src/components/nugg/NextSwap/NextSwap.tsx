import React, { FunctionComponent } from 'react';

import client from '@src/client';

type Props = {};

const NextSwap: FunctionComponent<Props> = () => {
    const epoch__id = client.live.epoch__id();

    const [on, setOn] = React.useState(true);

    const abc = React.useCallback(
        (tokenId: string) => {
            if (on) {
                setTimeout(() => {
                    client.actions.routeTo(tokenId, false);
                }, 10000);
            }
        },
        [on],
    );

    React.useEffect(() => {
        abc(epoch__id.toString());
        console.log(epoch__id);
    }, [epoch__id]);

    return <div></div>;
};

export default NextSwap;
