/* eslint-disable @typescript-eslint/no-unsafe-return */
import gql from 'graphql-tag';
import React, { useEffect } from 'react';

import { useFastQuery, useFasterQuery } from '@src/graphql/helpers';
import web3 from '@src/web3';
import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import { TokenId } from '@src/client/router';
import { useLiveDotnuggSubscription } from '@src/gql/types.generated';
import { useNuggftV1 } from '@src/contracts/useContract';
import { extractItemId } from '@src/lib';

// eslint-disable-next-line import/no-cycle
import client from '..';

type UseDotnuggResponse = Base64EncodedSvg | undefined | null;

export const useDotnuggInjectToCache = () => {
    const graph = client.live.graph();
    const nuggft = useNuggftV1();

    return React.useCallback(
        (tokenId: TokenId, data: Base64EncodedSvg) => {
            if (graph && nuggft) {
                void graph.cache.writeQuery({
                    // broadcast: true,
                    query: gql`
                        query ROOT_QUERY($tokenId: ID!) {
                            nugg(id: $tokenId) {
                                __typename
                                dotnuggRawCache
                            }
                        }
                    `,
                    variables: { tokenId },
                    // overwrite: true,
                    data: {
                        nugg: {
                            __typename: 'Nugg',
                            dotnuggRawCache: data,
                        },
                    },
                });
            }
        },
        [graph, nuggft],
    );
};

export const useDotnuggRpcBackup = (outer: UseDotnuggResponse, tokenId: TokenId) => {
    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();
    const graph = client.live.graph();

    const [src, setSrc] = React.useState<Base64EncodedSvg>();

    const inject = useDotnuggInjectToCache();

    useEffect(() => {
        if (tokenId && graph && chainId && provider && (outer === null || outer === undefined)) {
            void (async () => {
                const res = (await new NuggftV1Helper(chainId, provider).contract[
                    tokenId?.isItemId() ? 'itemURI' : 'imageURI'
                ](extractItemId(tokenId))) as Base64EncodedSvg | undefined;
                setSrc(res);
                if (res) void inject(tokenId, res);
            })();
        }
    }, [graph, chainId, provider, tokenId, outer]);

    return src;
};

export const useDotnugg = (tokenId: string) => {
    const main = useFastQuery<
        { [key in 'nugg' | 'item']?: { dotnuggRawCache: Base64EncodedSvg } },
        UseDotnuggResponse
    >(
        gql`
        query OptimizedDotNugg($tokenId: ID!) {
            ${tokenId?.isItemId() ? 'item' : 'nugg'}(id: $tokenId) {
                dotnuggRawCache
            }
        }
    `,
        {
            tokenId: tokenId?.replace('item-', ''),
        },
        (x) => {
            if (x.data.nugg !== undefined) return x.data.nugg.dotnuggRawCache;
            if (x.data.item !== undefined) return x.data.item.dotnuggRawCache;
            return null;
        },
    );

    const fallback = useDotnuggRpcBackup(main, tokenId);
    return main || fallback;
};

export const useDotnuggSubscription = (tokenId: string) => {
    const isItem = React.useMemo(() => {
        return tokenId?.isItemId();
    }, [tokenId]);

    const normal = useDotnugg(tokenId);

    const graph = client.live.graph();

    const [src, setSrc] = React.useState<Base64EncodedSvg>();

    useLiveDotnuggSubscription({
        client: graph,
        variables: {
            tokenId,
        },
        onSubscriptionData: (data) => {
            if (
                !isItem &&
                data &&
                data.subscriptionData &&
                data.subscriptionData.data &&
                data.subscriptionData.data.nugg &&
                data.subscriptionData.data.nugg.dotnuggRawCache
            ) {
                setSrc(data.subscriptionData.data.nugg.dotnuggRawCache as Base64EncodedSvg);
            }
        },
    });

    return isItem || !src ? normal : src;
};

export const useDotnuggCacheOnly = (tokenId: string) => {
    const main = useFasterQuery<
        {
            [key in 'nugg' | 'item']?: { dotnuggRawCache: Base64EncodedSvg };
        },
        UseDotnuggResponse
    >(
        gql`
            query OptimizedDotNugg($tokenId: ID!) {
                ${tokenId?.isItemId() ? 'item' : 'nugg'}(id: $tokenId) {
                    dotnuggRawCache
                }
            }
        `,
        {
            tokenId: tokenId?.replace('item-', ''),
        },
        (x) => {
            if (x.data.nugg) return x.data.nugg.dotnuggRawCache;
            if (x.data.item) return x.data.item.dotnuggRawCache;
            return null;
        },
    );

    const fallback = useDotnuggRpcBackup(main, tokenId);
    return main || fallback;
};
