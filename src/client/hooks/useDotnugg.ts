/* eslint-disable @typescript-eslint/no-unsafe-return */
import gql from 'graphql-tag';
import React, { useMemo, useEffect } from 'react';
import { useApolloClient } from '@apollo/client';

import web3 from '@src/web3';
import {
    useGetDotnuggItemQuery,
    useGetDotnuggNuggQuery,
    GetDotnuggNuggQuery,
} from '@src/gql/types.generated';
import { useNuggftV1, useXNuggftV1 } from '@src/contracts/useContract';
import { isUndefinedOrNullOrStringEmpty } from '@src/lib';

// eslint-disable-next-line import/no-cycle
import client from '..';

export const useDotnuggInjectToCache = () => {
    const graph = client.live.graph();
    const nuggft = useNuggftV1();

    return React.useCallback(
        (tokenId: TokenId, data: Base64EncodedSvg) => {
            if (graph && nuggft) {
                void graph.cache.writeQuery({
                    // broadcast: true,
                    query: tokenId.isItemId()
                        ? gql`
                              query ROOT_QUERY($tokenId: ID!) {
                                  item(id: $tokenId) {
                                      __typename
                                      id
                                      dotnuggRawCache
                                  }
                              }
                          `
                        : gql`
                              query ROOT_QUERY($tokenId: ID!) {
                                  nugg(id: $tokenId) {
                                      __typename
                                      id
                                      dotnuggRawCache
                                  }
                              }
                          `,
                    variables: { tokenId: tokenId.toRawId() },
                    // overwrite: true,
                    data: {
                        [tokenId.isItemId() ? 'item' : 'nugg']: {
                            __typename: tokenId.isItemId() ? 'Item' : 'Nugg',
                            id: tokenId.toRawId(),
                            dotnuggRawCache: data,
                        },
                    },
                });
            }
        },
        [graph, nuggft],
    );
};

export const useDotnuggRpcCallback = () => {
    const provider = web3.hook.usePriorityProvider();

    const nuggft = useNuggftV1(provider);

    const xnuggft = useXNuggftV1(provider);

    const inject = useDotnuggInjectToCache();

    const callAsync = React.useCallback(
        async (tokenId: TokenId) => {
            if (!provider) return undefined;
            return (tokenId.isItemId() ? xnuggft : nuggft).imageSVG(tokenId.toRawId()).then((x) => {
                if (x !== '') {
                    inject(tokenId, x as Base64EncodedSvg);
                }
                return x as Base64EncodedSvg;
            });
        },
        [nuggft, xnuggft, inject, provider],
    );

    return callAsync;
};

export const useDotnuggRpcBackup2 = (use: boolean, tokenId?: TokenId) => {
    const [src, setSrc] = React.useState<Base64EncodedSvg>();

    const callback = useDotnuggRpcCallback();

    useEffect(() => {
        if (tokenId && use) {
            void (async () => {
                const res = (await callback(tokenId)) as Base64EncodedSvg | undefined;

                setSrc(res);
            })();
        }
    }, [tokenId, use, callback]);

    return src;
};

export const useDotnuggSubscription = (
    activate: boolean,
    tokenId?: TokenId,
): Base64EncodedSvg | undefined => {
    const isItem = React.useMemo(() => {
        return tokenId?.isItemId();
    }, [tokenId]);

    const inject = useDotnuggInjectToCache();

    const callback = useDotnuggRpcCallback();

    const [rpcBackup, setRpcBackup] = React.useState<Base64EncodedSvg>();

    const { data: nuggSrc } = useGetDotnuggNuggQuery({
        pollInterval: 5000,
        skip: !tokenId || !activate || isItem,
        fetchPolicy: 'network-only',
        nextFetchPolicy: 'network-only',
        variables: {
            tokenId: tokenId?.toRawId() || '',
        },
        onCompleted: (data) => {
            if (tokenId) {
                if (data.nugg?.dotnuggRawCache) {
                    inject(tokenId, data.nugg?.dotnuggRawCache as Base64EncodedSvg);
                    setRpcBackup(undefined);
                } else {
                    void callback(tokenId).then((x) => x && setRpcBackup(x));
                }
            }
        },
    });

    const { data: itemSrc } = useGetDotnuggItemQuery({
        pollInterval: 5000,
        skip: !tokenId || !activate || !isItem,

        fetchPolicy: 'network-only',

        variables: {
            tokenId: tokenId?.toRawId() || '',
        },
        onCompleted: (data) => {
            if (tokenId) {
                if (data.item?.dotnuggRawCache) {
                    inject(tokenId, data.item?.dotnuggRawCache as Base64EncodedSvg);
                    setRpcBackup(undefined);
                } else {
                    void callback(tokenId).then(setRpcBackup);
                }
            }
        },
    });

    if (rpcBackup) return rpcBackup;

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
    tokenId?: TokenId,
    forceCache = false,
) => {
    const {
        data: nuggRes,
        error: nuggErr,
        called: nuggCalled,
    } = useGetDotnuggNuggQuery({
        fetchPolicy: forceCache ? 'cache-only' : 'cache-first',
        skip: !tokenId || forceCache || !shouldLoad || tokenId.isItemId(),
        variables: { tokenId: tokenId?.toRawId() || '' },
    });

    const {
        data: itemRes,
        error: itemErr,
        called: itemCalled,
    } = useGetDotnuggItemQuery({
        fetchPolicy: forceCache ? 'cache-only' : 'cache-first',
        skip: !tokenId || forceCache || !shouldLoad || !tokenId.isItemId(),
        variables: { tokenId: tokenId?.toRawId() || '' },
    });

    const clienter = useApolloClient();

    const src = useMemo(() => {
        if (tokenId) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const todo: GetDotnuggNuggQuery['nugg'] = clienter.readFragment({
                id: `${tokenId.isItemId() ? 'Item' : 'Nugg'}:${tokenId.toRawId()}`, // The value of the to-do item's cache ID
                fragment: tokenId.isItemId()
                    ? gql`
                          fragment dnuggI on Item {
                              id
                              dotnuggRawCache
                          }
                      `
                    : gql`
                          fragment dnuggN on Nugg {
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
        }
        return undefined;
    }, [itemRes, nuggRes, tokenId, clienter]);

    const error = useMemo(() => {
        if (src && src.startsWith('ERROR')) return true;
        return tokenId ? (tokenId.isItemId() ? !!itemErr : !!nuggErr) : undefined;
    }, [itemErr, nuggErr, tokenId, src]);

    const fallback = useDotnuggRpcBackup2(!!error, tokenId);

    const isEmpty = useMemo(() => {
        return (
            tokenId &&
            (tokenId.isItemId() ? itemCalled : nuggCalled) &&
            (isUndefinedOrNullOrStringEmpty(src) || src.startsWith('ERROR')) &&
            isUndefinedOrNullOrStringEmpty(fallback)
        );
    }, [itemCalled, nuggCalled, src, fallback, tokenId]);

    return { src: !error ? src : fallback, isEmpty };
};
