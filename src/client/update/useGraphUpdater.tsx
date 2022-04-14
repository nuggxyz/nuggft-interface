import React from 'react';

import core from '@src/client/core';
import { TokenId } from '@src/client/router';
import useLiveItem from '@src/client/subscriptions/useLiveItem';
import useLiveNugg from '@src/client/subscriptions/useLiveNugg';
import useMountLogger from '@src/hooks/useMountLogger';

export const useTriggerGraphRefresh = () => {
    // const updateClients = client.mutate.updateClients();
    // const graphClient = client.live.graph();
    // const triggerGraphRefresh = useCallback(() => {
    //     // if (chainId && web3.config.isValidChainId(chainId)) {
    //     //     if (graphClient) {
    //     //         void graphClient.clearStore();
    //     //         graphClient.stop();
    //     //     }
    //     //     const gclient = web3.config.createApolloClient(chainId);
    //     //     updateClients(gclient);
    //     // }
    // }, [updateClients, graphClient]);
    // return { triggerGraphRefresh };
};

export const DynamicTokenSubscriptions = () => {
    const Subs = React.memo(
        ({ tokenId }: { tokenId: TokenId | undefined }) => {
            useMountLogger(`ayo - ${tokenId || ''}`);
            useLiveItem(tokenId);
            useLiveNugg(tokenId);
            return (<></>) as unknown as JSX.Element;
        },
        (a, b) => a.tokenId === b.tokenId,
    );

    const List = React.memo(
        ({ list }: { list: string[] }) => {
            return (
                <>
                    {list.map((x) => (
                        <Subs tokenId={x} />
                    ))}
                </>
            );
        },
        (a, b) => a.list.length === b.list.length,
    );

    const queue = core(
        (state) => state.subscriptionQueue,
        (a, b) => JSON.stringify(a) === JSON.stringify(b),
    );

    console.log('UPDAAAATTEEEEEEEEE', queue);

    return <List list={queue} />;
};
