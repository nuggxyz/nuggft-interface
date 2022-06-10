/* eslint-disable no-param-reassign */
import { ApolloClient, ApolloLink, FetchResult } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import React from 'react';
import create from 'zustand';
import { combine, persist, subscribeWithSelector } from 'zustand/middleware';

import { HealthQuery, HealthQueryVariables, HealthDocument } from '@src/gql/types.generated';
import useInterval from '@src/hooks/useInterval';
import { apolloClient } from '@src/web3/config';

import block from './block';

export interface Health {
    lastBlockRpc: number;
    lastBlockGraph: number;
    lastGraphResponse: FetchResult<
        'null' | 'non-null',
        Record<string, any>,
        Record<string, any>
    > & { time: number };
}

const useStore = create(
    persist(
        subscribeWithSelector(
            combine({ lastBlockRpc: 0, lastBlockGraph: 0 } as Health, (set) => {
                const updateLastRpcBlock = (blocknum: number) => {
                    // @ts-ignore
                    set((draft) => {
                        draft.lastBlockRpc = blocknum;
                    });
                };

                const updateLastBlockGraph = (blocknum: number) => {
                    // @ts-ignore
                    set((draft) => {
                        draft.lastBlockGraph = blocknum;
                    });
                };

                const generateApolloResponseErrorMiddleware = () => {
                    return onError(({ graphQLErrors, networkError, operation }) => {
                        if (graphQLErrors)
                            graphQLErrors.forEach((hi) => {
                                console.log(
                                    `[GraphQL error:${operation.operationName}:${JSON.stringify(
                                        operation.variables,
                                    )}]: Message: ${hi.message}`,
                                );
                            });

                        if (networkError)
                            console.log(
                                `[Network error:${operation.operationName}:${JSON.stringify(
                                    operation.variables,
                                )}]: ${networkError.message}`,
                            );
                    });
                };

                const generateApolloResponseMiddleware = () => {
                    return new ApolloLink((operation, forward) => {
                        return forward(operation).map((response) => {
                            const lastGraphResponse = {
                                ...response,
                                data:
                                    response.data === null
                                        ? ('null' as const)
                                        : ('non-null' as const),
                                time: new Date().getTime(),
                            };
                            set(() => ({
                                lastGraphResponse,
                            }));

                            const { data } = response as {
                                data?: {
                                    _meta?: {
                                        __typename: '_Meta_';
                                        block: { __typename: '_Block_'; number: number };
                                    };
                                };
                            };

                            if (data?._meta) {
                                const lastBlockGraph = data._meta.block.number;
                                set(() => ({ lastBlockGraph }));
                            }

                            return response;
                        });
                    });
                };

                const fetch = (client?: ApolloClient<any>) => {
                    if (!client) return Promise.resolve();
                    return client.query<HealthQuery, HealthQueryVariables>({
                        query: HealthDocument,
                        fetchPolicy: 'network-only',
                    });
                };

                return {
                    fetch,
                    updateLastRpcBlock,
                    updateLastBlockGraph,
                    generateApolloResponseMiddleware,
                    generateApolloResponseErrorMiddleware,
                };
            }),
        ),
        { name: 'nugg.xyz-health' },
    ),
);

export const useHealthUpdater = () => {
    const fetch = useStore((state) => state.fetch);

    useInterval(
        React.useCallback(() => {
            void fetch(apolloClient);
        }, [fetch]),
        4000,
    );
};

const useHealth = () => {
    const lastBlockRpc = block.useBlock();
    const lastBlockGraph = useStore((state) => state.lastBlockGraph);

    const blockdiff = React.useMemo(() => {
        return Math.abs(lastBlockGraph - lastBlockRpc) || Number(0);
    }, [lastBlockGraph, lastBlockRpc]);

    const graphProblem = React.useMemo(() => {
        return blockdiff > 5 && lastBlockGraph < lastBlockRpc;
    }, [lastBlockGraph, lastBlockRpc, blockdiff]);

    return { blockdiff, graphProblem };
};

const useCallbackOnGraphBlockChange = (callback: (() => Promise<unknown>) | (() => unknown)) => {
    React.useEffect(() => {
        const a = useStore.subscribe((data) => data.lastBlockGraph, callback);

        return a;
    }, [callback]);

    React.useEffect(() => {
        callback();
    }, []);

    return null;
};

export default {
    useLastGraphBlock: () => useStore((draft) => draft.lastBlockGraph),
    useLastRpcBlock: () => useStore((draft) => draft.lastBlockRpc),
    useLastGraphResponse: () => useStore((draft) => draft.lastGraphResponse),

    useHealth,
    useCallbackOnGraphBlockChange,
    useUpdateLastBlockGraph: () => useStore((draft) => draft.updateLastBlockGraph),
    ...useStore,
};
