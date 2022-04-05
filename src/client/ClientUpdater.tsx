import React from 'react';

import client from '@src/client';

import useRpcUpdater from './update/useRpcUpdater';
import useMediaUpdater from './update/useMediaUpdater';
import useBackgroundUpdater from './update/useBackgroundUpdater';
import useLiveProtocol from './subscriptions/useLiveProtocol';
import useLiveUser from './subscriptions/useLiveUser';
import useSwapUpdater from './update/useSwapUpdater';
import useLiveGraphHealth from './subscriptions/useLiveGraphHealth';

const GraphConditionalHooks = () => {
    useLiveProtocol();

    useLiveUser();

    useLiveGraphHealth();

    return null;
};

export default () => {
    const graph = client.live.graph();

    useMediaUpdater();

    useBackgroundUpdater();

    useRpcUpdater();

    // useGraphUpdater();

    useSwapUpdater();

    return (
        <>
            {/* conditional hooks */}
            {graph && <GraphConditionalHooks />}
        </>
    );
};
