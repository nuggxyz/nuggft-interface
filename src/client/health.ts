/* eslint-disable no-param-reassign */
import { ApolloClient, ApolloLink, FetchResult } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import React from 'react';
import create from 'zustand';
import { combine, subscribeWithSelector } from 'zustand/middleware';

import { HealthQuery, HealthQueryVariables, HealthDocument } from '@src/gql/types.generated';
import useInterval from '@src/hooks/useInterval';
import { apolloClient } from '@src/web3/config';
import web3 from '@src/web3';

import block from './block';

export interface Health {
	lastBlockRpc: number;
	lastBlockGraph: number;
	lastGraphResponse: FetchResult<
		'null' | 'non-null',
		Record<string, any>,
		Record<string, any>
	> & { time: number };
	lastBlockGraphTimestamp: number;
	graphNetworkDown: boolean;
	response: boolean;
}

const useStore = create(
	subscribeWithSelector(
		combine(
			{
				lastBlockRpc: 0,
				lastBlockGraph: 0,
				lastBlockGraphTimestamp: 0,
				graphNetworkDown: false,
				response: false,
			} as Health,
			(set) => {
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

				const updateLastBlockGraphTimestamp = (timestamp: number) => {
					// @ts-ignore
					set((draft) => {
						draft.lastBlockGraphTimestamp = timestamp;
					});
				};

				const generateApolloResponseErrorMiddleware = () => {
					return onError(({ graphQLErrors, networkError, operation }) => {
						if (graphQLErrors) {
							graphQLErrors.forEach((hi) => {
								console.log(
									`[GraphQL error:${operation.operationName}:${JSON.stringify(
										operation.variables,
									)}]: Message: ${hi.message}`,
								);
							});

							if (operation.operationName === 'health') {
								set(() => ({
									graphNetworkDown: true,
								}));
							}
						}
						if (networkError) {
							console.log(
								`[Network error:${operation.operationName}:${JSON.stringify(
									operation.variables,
								)}]: ${networkError.message}`,
							);
						}
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
								response: true,
							}));

							if (!response.errors) {
								set(() => ({
									graphNetworkDown: false,
								}));
							}

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
								set(() => ({ lastBlockGraph, response: true }));
							}

							return response;
						});
					});
				};

				const fetch = (client?: ApolloClient<any>) => {
					if (!client) return Promise.resolve();
					return client.query<HealthQuery, HealthQueryVariables>({
						query: HealthDocument,
						fetchPolicy: 'no-cache',
					});
				};

				return {
					fetch,
					updateLastRpcBlock,
					updateLastBlockGraph,
					generateApolloResponseMiddleware,
					generateApolloResponseErrorMiddleware,
					updateLastBlockGraphTimestamp,
				};
			},
		),
	),
);

export const useHealthUpdater = () => {
	const fetch = useStore((state) => state.fetch);
	const updateLastBlockGraphTimestamp = useStore((state) => state.updateLastBlockGraphTimestamp);
	const history = block.useHistory();

	useInterval(
		React.useCallback(() => {
			void fetch(apolloClient);
		}, [fetch]),
		4000,
	);

	React.useEffect(() => {
		void fetch(apolloClient);
	}, []);

	const lastBlockGraph = useStore((state) => state.lastBlockGraph);
	const graphProblem = useHealth();

	React.useEffect(() => {
		if (lastBlockGraph && !graphProblem) {
			const check = history.find((x) => x.block === lastBlockGraph)?.time;
			updateLastBlockGraphTimestamp(check ?? new Date().getTime());
		}
	}, [lastBlockGraph, history, graphProblem, updateLastBlockGraphTimestamp]);

	const provider = web3.hook.usePriorityProvider();

	React.useEffect(() => {
		if (provider && graphProblem) {
			void provider
				.getBlock(lastBlockGraph)
				.then((blk) => {
					updateLastBlockGraphTimestamp(blk.timestamp * 1000);
				})
				.catch(() => {});
		}
	}, [graphProblem, lastBlockGraph, provider, updateLastBlockGraphTimestamp]);
};

const useHealth = () => {
	const lastBlockRpc = block.useBlock();
	const lastBlockGraph = useStore((state) => state.lastBlockGraph);
	const response = useStore((state) => state.response);

	const blockdiff = React.useMemo(() => {
		return Math.abs(lastBlockGraph - lastBlockRpc) || Number(0);
	}, [lastBlockGraph, lastBlockRpc]);

	const graphProblem = React.useMemo(() => {
		return blockdiff > 5 && lastBlockGraph < lastBlockRpc;
	}, [lastBlockGraph, lastBlockRpc, blockdiff]);

	const graphNetworkDown = useStore((state) => state.graphNetworkDown);

	return response && (graphProblem || graphNetworkDown);
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
	useLastGraphBlockTimestamp: () => useStore((draft) => draft.lastBlockGraphTimestamp),

	useHealth,
	useCallbackOnGraphBlockChange,
	useUpdateLastBlockGraph: () => useStore((draft) => draft.updateLastBlockGraph),
	...useStore,
};
