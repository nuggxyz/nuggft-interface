import React from 'react';

import client from '@src/client';

import useRpcUpdater from './update/useRpcUpdater';
import useLiveOffers from './subscriptions/useLiveOffers';
import useLiveToken from './subscriptions/useLiveToken';
import useMediaUpdater from './update/useMediaUpdater';
import useBackgroundUpdater from './update/useBackgroundUpdater';
import useLiveProtocol from './subscriptions/useLiveProtocol';
import useLiveUser from './subscriptions/useLiveUser';
import useGraphUpdater from './update/useGraphUpdater';
import useStartup from './subscriptions/useStartup';

const GraphConditionalHooks = () => {
    useStartup();

    useLiveOffers(client.live.lastSwap.tokenId());

    useLiveToken(client.live.lastSwap.tokenId());

    useLiveToken(client.live.lastView.tokenId());

    useLiveProtocol();

    useLiveUser();

    return null;
};

export default () => {
    const graph = client.live.graph();

    useMediaUpdater();

    useBackgroundUpdater();

    useRpcUpdater();

    useGraphUpdater();

    return (
        <>
            {/* conditional hooks */}
            {graph && <GraphConditionalHooks />}
        </>
    );
};
