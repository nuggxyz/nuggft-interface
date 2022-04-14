/* eslint-disable @typescript-eslint/no-unsafe-return */
import gql from 'graphql-tag';
import React, { useMemo, useEffect } from 'react';
import { useApolloClient } from '@apollo/client';

import { useFastQuery } from '@src/gql/helpers';
import web3 from '@src/web3';
import { TokenId } from '@src/client/router';
import {
    useGetDotnuggItemQuery,
    useGetDotnuggNuggQuery,
    GetDotnuggNuggQuery,
} from '@src/gql/types.generated';
import { useNuggftV1 } from '@src/contracts/useContract';
import { extractItemId, isUndefinedOrNullOrStringEmpty } from '@src/lib';

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

export const useDotnuggRpcBackup2 = (use: boolean, tokenId: TokenId) => {
    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();
    const graph = client.live.graph();

    const [src, setSrc] = React.useState<Base64EncodedSvg>();

    const inject = useDotnuggInjectToCache();

    const nuggft = useNuggftV1(provider);

    useEffect(() => {
        if (tokenId && graph && chainId && provider && use) {
            void (async () => {
                const res = (await nuggft[tokenId?.isItemId() ? 'itemURI' : 'imageURI'](
                    extractItemId(tokenId),
                )) as Base64EncodedSvg | undefined;
                setSrc(res);
                if (res) void inject(tokenId, res);
            })();
        }
    }, [graph, chainId, provider, tokenId, use, inject, nuggft]);

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

    const fallback = useDotnuggRpcBackup2(main === undefined, tokenId);
    return main || fallback;
};

export const useDotnuggSubscription = (
    activate: boolean,
    tokenId: string,
): Base64EncodedSvg | undefined => {
    const isItem = React.useMemo(() => {
        return tokenId?.isItemId();
    }, [tokenId]);

    const graph = client.live.graph();

    const inject = useDotnuggInjectToCache();

    const { data: nuggSrc } = useGetDotnuggNuggQuery({
        client: graph,
        pollInterval: 15000,
        skip: !activate || isItem,
        fetchPolicy: 'network-only',
        variables: {
            tokenId,
        },
        onCompleted: (data) => {
            if (data.nugg?.dotnuggRawCache)
                inject(tokenId, data.nugg?.dotnuggRawCache as Base64EncodedSvg);
        },
    });

    const { data: itemSrc } = useGetDotnuggItemQuery({
        client: graph,
        pollInterval: 15000,
        skip: !activate || !isItem,
        variables: {
            tokenId: extractItemId(tokenId),
        },
        onCompleted: (data) => {
            if (data.item?.dotnuggRawCache)
                inject(tokenId, data.item?.dotnuggRawCache as Base64EncodedSvg);
        },
    });

    return isItem
        ? (itemSrc?.item?.dotnuggRawCache as Base64EncodedSvg)
        : (nuggSrc?.nugg?.dotnuggRawCache as Base64EncodedSvg);
};

// export const useDotnuggCacheOnly = (tokenId: string) => {
//     const [getNugg, nuggRes] = useGetDotnuggNuggLazyQuery({
//         client: apolloClient,
//         fetchPolicy: 'cache-first',
//     });

//     const [getItem, itemRes] = useGetDotnuggItemLazyQuery({
//         client: apolloClient,
//         fetchPolicy: 'cache-first',
//     });

//     useEffect(() => {
//         void (tokenId.isItemId() ? getItem : getNugg)({
//             variables: { tokenId: tokenId.isItemId() ? extractItemId(tokenId) : tokenId },
//         });
//     }, [tokenId, getItem, getNugg]);

//     const src = useMemo(() => {
//         return tokenId.isItemId()
//             ? (itemRes.data?.item?.dotnuggRawCache as Base64EncodedSvg)
//             : (nuggRes.data?.nugg?.dotnuggRawCache as Base64EncodedSvg);
//     }, [itemRes, nuggRes, tokenId]);

//     const error = useMemo(() => {
//         return tokenId.isItemId() ? !!itemRes.error : !!nuggRes.error;
//     }, [itemRes, nuggRes, tokenId]);

//     const fallback = useDotnuggRpcBackup2(error, tokenId);

//     return !error ? src : fallback;
// };

export const useDotnuggCacheOnlyLazy = (
    shouldLoad: boolean,
    tokenId: string,
    forceCache = false,
) => {
    const {
        data: nuggRes,
        error: nuggErr,
        called: nuggCalled,
    } = useGetDotnuggNuggQuery({
        fetchPolicy: forceCache ? 'cache-only' : 'cache-first',
        skip: forceCache || !shouldLoad || tokenId.isItemId(),
        variables: { tokenId: tokenId.isItemId() ? extractItemId(tokenId) : tokenId },
    });

    const {
        data: itemRes,
        error: itemErr,
        called: itemCalled,
    } = useGetDotnuggItemQuery({
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
            ? (itemRes?.item?.dotnuggRawCache as Base64EncodedSvg | undefined)
            : (nuggRes?.nugg?.dotnuggRawCache as Base64EncodedSvg | undefined);
    }, [itemRes, nuggRes, tokenId, clienter]);

    const error = useMemo(() => {
        return tokenId.isItemId() ? !!itemErr : !!nuggErr;
    }, [itemErr, nuggErr, tokenId]);

    const fallback = useDotnuggRpcBackup2(error, tokenId);

    const isEmpty = useMemo(() => {
        return (
            (tokenId.isItemId() ? itemCalled : nuggCalled) &&
            isUndefinedOrNullOrStringEmpty(src) &&
            isUndefinedOrNullOrStringEmpty(fallback)
        );
    }, [itemCalled, nuggCalled, src, fallback, tokenId]);

    return { src: !error ? src : fallback, isEmpty };
};
