import { useCallback, useEffect } from 'react';

import { useGetLiveItemLazyQuery, useGetLiveNuggLazyQuery } from '@src/gql/types.generated';
import { parseRoute, Route } from '@src/client/router';
import { extractItemId } from '@src/lib';
import formatLiveNugg from '@src/client/formatters/formatLiveNugg';
import client from '@src/client';
import formatLiveItem from '@src/client/formatters/formatLiveItem';
import web3 from '@src/web3';

export const useStartupCallback = () => {
    const graph = client.live.graph();
    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();

    const updateToken = client.mutate.updateToken();
    const updateBlocknum = client.mutate.updateBlocknum();

    const [itemLazyQuery] = useGetLiveItemLazyQuery({ client: graph });
    const [nuggLazyQuery] = useGetLiveNuggLazyQuery({ client: graph });

    return useCallback(async () => {
        if (provider && graph && chainId) {
            const route = parseRoute(window.location.hash);

            if (route.type !== Route.Home) {
                const isItem = route.type === Route.ViewItem || route.type === Route.SwapItem;

                if (!isItem) {
                    await nuggLazyQuery({
                        variables: { tokenId: route.tokenId },
                    }).then((x) => {
                        if (x.data) {
                            if (!x.data.nugg) window.location.hash = '#/';
                            else {
                                const formatted = formatLiveNugg(x.data.nugg);
                                if (formatted) {
                                    updateToken(route.tokenId, formatted);
                                }
                            }
                        }
                    });
                } else {
                    await itemLazyQuery({
                        variables: { tokenId: extractItemId(route.tokenId) },
                    }).then((x) => {
                        if (x.data) {
                            if (!x.data.item) window.location.hash = '#/';
                            else {
                                const formatted = formatLiveItem(x.data.item);
                                if (formatted) {
                                    updateToken(route.tokenId, formatted);
                                }
                            }
                        }
                    });
                }
            }

            await provider.getBlockNumber().then((num) => updateBlocknum(num, chainId, true));
        }
    }, [provider, graph, chainId, nuggLazyQuery, itemLazyQuery, updateBlocknum, updateToken]);
};

export default () => {
    const graph = client.live.graph();
    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();

    const callback = useStartupCallback();

    useEffect(() => {
        if (provider && graph && chainId) void callback();
    }, [provider, graph, chainId, callback]);

    return null;
};
