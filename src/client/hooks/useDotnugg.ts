/* eslint-disable @typescript-eslint/no-unsafe-return */
import gql from 'graphql-tag';
import React, { useMemo, useEffect } from 'react';
import { useApolloClient } from '@apollo/client';

import { useFastQuery } from '@src/graphql/helpers';
import web3 from '@src/web3';
import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import { TokenId } from '@src/client/router';
import {
    useLiveDotnuggSubscription,
    useGetDotnuggNuggLazyQuery,
    useGetDotnuggItemLazyQuery,
    useGetDotnuggItemQuery,
    useGetDotnuggNuggQuery,
    GetDotnuggNuggQuery,
} from '@src/gql/types.generated';
import { useNuggftV1 } from '@src/contracts/useContract';
import { extractItemId } from '@src/lib';
import { apolloClient } from '@src/web3/config';

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
                                id
                                dotnuggRawCache
                            }
                        }
                    `,
                    variables: { tokenId },
                    // overwrite: true,
                    data: {
                        nugg: {
                            __typename: 'Nugg',
                            id: tokenId,
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

export const useDotnuggRpcBackup2 = (use: boolean, tokenId: TokenId) => {
    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();
    const graph = client.live.graph();

    const [src, setSrc] = React.useState<Base64EncodedSvg>();

    const inject = useDotnuggInjectToCache();

    useEffect(() => {
        if (tokenId && graph && chainId && provider && use) {
            void (async () => {
                console.log('AYYYYOOOOOOO');
                const res = (await new NuggftV1Helper(chainId, provider).contract[
                    tokenId?.isItemId() ? 'itemURI' : 'imageURI'
                ](extractItemId(tokenId))) as Base64EncodedSvg | undefined;
                setSrc(res);
                if (res) void inject(tokenId, res);
            })();
        }
    }, [graph, chainId, provider, tokenId, use, inject]);

    return src;
};

export const useDotnugg = (tokenId: string) => {
    const main = useFastQuery<
        { [key in 'nugg' | 'item']?: { dotnuggRawCache: Base64EncodedSvg } },
        UseDotnuggResponse
    >(
        tokenId?.isItemId()
            ? gql`
                  query OptimizedDotNugg($tokenId: ID!) {
                      item(id: $tokenId) {
                          id
                          dotnuggRawCache
                      }
                  }
              `
            : gql`
                  query OptimizedDotNugg($tokenId: ID!) {
                      nugg(id: $tokenId) {
                          id
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
    const [getNugg, nuggRes] = useGetDotnuggNuggLazyQuery({
        client: apolloClient,
        fetchPolicy: 'cache-first',
    });

    const [getItem, itemRes] = useGetDotnuggItemLazyQuery({
        client: apolloClient,
        fetchPolicy: 'cache-first',
    });

    useEffect(() => {
        void (tokenId.isItemId() ? getItem : getNugg)({
            variables: { tokenId: tokenId.isItemId() ? extractItemId(tokenId) : tokenId },
        });
    }, [tokenId, getItem, getNugg]);

    const src = useMemo(() => {
        return tokenId.isItemId()
            ? (itemRes.data?.item?.dotnuggRawCache as Base64EncodedSvg)
            : (nuggRes.data?.nugg?.dotnuggRawCache as Base64EncodedSvg);
    }, [itemRes, nuggRes, tokenId]);

    const error = useMemo(() => {
        return tokenId.isItemId() ? !!itemRes.error : !!nuggRes.error;
    }, [itemRes, nuggRes, tokenId]);

    const fallback = useDotnuggRpcBackup2(error, tokenId);

    return !error ? src : fallback;
};

export const useDotnuggCacheOnlyLazy = (
    shouldLoad: boolean,
    tokenId: string,
    forceCache = false,
) => {
    const nuggRes = useGetDotnuggNuggQuery({
        fetchPolicy: forceCache ? 'cache-only' : 'cache-first',
        skip: forceCache || !shouldLoad || tokenId.isItemId(),
        variables: { tokenId: tokenId.isItemId() ? extractItemId(tokenId) : tokenId },
    });

    const { data: itemRes, error: itemErr } = useGetDotnuggItemQuery({
        fetchPolicy: forceCache ? 'cache-only' : 'cache-first',
        skip: forceCache || !shouldLoad || !tokenId.isItemId(),
        variables: { tokenId: tokenId.isItemId() ? extractItemId(tokenId) : tokenId },
    });

    const clienter = useApolloClient();

    const src = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const todo: GetDotnuggNuggQuery['nugg'] = clienter.readFragment({
            id: `${tokenId.isItemId() ? 'Item' : 'Nugg'}:${
                tokenId.isItemId() ? extractItemId(tokenId) : tokenId
            }`, // The value of the to-do item's cache ID
            fragment: tokenId.isItemId()
                ? gql`
                      fragment dnugg on Item {
                          id
                          dotnuggRawCache
                      }
                  `
                : gql`
                      fragment dnugg on Nugg {
                          id
                          dotnuggRawCache
                      }
                  `,
        });
        if (todo) {
            return todo.dotnuggRawCache as Base64EncodedSvg;
        }
        return tokenId.isItemId()
            ? (itemRes?.item?.dotnuggRawCache as Base64EncodedSvg)
            : (nuggRes.data?.nugg?.dotnuggRawCache as Base64EncodedSvg);
    }, [itemRes, nuggRes, tokenId]);

    const error = useMemo(() => {
        return tokenId.isItemId() ? !!itemErr : !!nuggRes.error;
    }, [itemErr, nuggRes, tokenId]);

    const fallback = useDotnuggRpcBackup2(error, tokenId);

    return !error ? src : fallback;
};
