import { ApolloClient, ApolloQueryResult, DocumentNode } from '@apollo/client';
import React, { useState } from 'react';

import client from '@src/client';
import { isUndefinedOrNullOrObjectEmpty } from '@src/lib';

export const executeQuery2 = async (
	_client: ApolloClient<any>,
	query: DocumentNode,
	tableName: string,
) => {
	try {
		const result = await _client.query<{ data: { [a: typeof tableName]: unknown } }>({
			query,
			fetchPolicy: 'no-cache',
		});

		if (
			!isUndefinedOrNullOrObjectEmpty(result) &&
			!isUndefinedOrNullOrObjectEmpty(result.data) &&
			tableName in result.data
		) {
			// @ts-ignore
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return result.data[tableName];
		}
	} catch (error: unknown) {
		throw new Error(error as string);
	}
	return undefined;
};

export const executeQuery3b = async <T>(
	check: ApolloClient<any>,
	query: DocumentNode,
	variables: object,
): Promise<T> => {
	try {
		if (check === undefined) throw new Error('executeQuery3 | graph is undefined');

		const result = await check.query<T>({
			query,
			fetchPolicy: 'cache-first',
			canonizeResults: true,
			// notifyOnNetworkStatusChange: true,
			variables,
		});

		if (result && result.data) {
			return result.data;
		}

		throw new Error('executeQuery3 failed');
	} catch (error: unknown) {
		throw new Error(error as string);
	}
};
export const executeQuery3c = async <T extends { data?: any }>(
	check: ApolloClient<any>,
	query: DocumentNode,
	variables: object,
): Promise<T['data']> => {
	try {
		if (check === undefined) throw new Error('executeQuery3 | graph is undefined');

		const result = await check
			.query<T>({
				query,
				fetchPolicy: 'cache-first',
				canonizeResults: true,
				// notifyOnNetworkStatusChange: true,
				variables,
			})
			.catch(() => {
				return undefined;
			});

		if (result && result.data) {
			return result.data;
		}
	} catch (error: unknown) {
		throw new Error(error as string);
	}
	return undefined;
};

// export const executeQuery3 = async <T>(query: DocumentNode, variables: object): Promise<T> => {
//     try {
//         const check = client.static.graph();

//         if (check === undefined) throw new Error('executeQuery3 | graph is undefined');

//         const result = await check.query<T>({
//             query,
//             fetchPolicy: 'cache-first',
//             canonizeResults: true,
//             // notifyOnNetworkStatusChange: true,
//             variables,
//         });

//         if (result && result.data) {
//             return result.data;
//         }

//         throw new Error('executeQuery3 failed');
//     } catch (error: unknown) {
//         throw new Error(error as string);
//     }
// };

export const executeQuery4 = async <T>(
	graph: ApolloClient<any>,
	query: DocumentNode,
	variables: object,
) => {
	try {
		const result = await graph.query<T>({
			query,
			// @ts-ignore
			// fetchPolicy: 'cache-and-network',
			fetchPolicy: 'cache-first',
			canonizeResults: true,
			notifyOnNetworkStatusChange: true,
			variables,
		});

		if (result && result.data) {
			return result.data;
		}
		throw new Error('executeQuery3 failed');
	} catch (error: unknown) {
		throw new Error(error as string);
	}
};

export const executeQuery5 = <T>(
	graph: ApolloClient<any>,
	query: DocumentNode,
	variables: object,
) => {
	return graph.watchQuery<T>({
		query,
		fetchPolicy: 'cache-and-network',
		canonizeResults: true,
		notifyOnNetworkStatusChange: true,
		variables,
	});
};

export const executeQuery6 = <T>(
	graph: ApolloClient<any>,
	query: DocumentNode,
	variables: object,
) => {
	// if (check === undefined)return  undefined;

	return graph.watchQuery<T>({
		query,
		fetchPolicy: 'cache-first',
		canonizeResults: true,
		notifyOnNetworkStatusChange: true,
		variables,
	});
};

export const fasterQuery = <T, R>(
	graph: ApolloClient<any>,
	query: DocumentNode,
	variables: object,
	formatter: (res: ApolloQueryResult<T>) => R,
) => {
	const a = executeQuery6<T>(graph, query, variables);
	return a.map(formatter);
};

export const fastQuery = <T, R>(
	graph: ApolloClient<any>,
	query: DocumentNode,
	variables: object,
	formatter: (res: ApolloQueryResult<T>) => R,
) => {
	const a = executeQuery5<T>(graph, query, variables);
	return a.map(formatter);
};

export const useFasterQuery = <T, R>(
	query: DocumentNode,
	variables: object,
	formatter: (res: ApolloQueryResult<T>) => R,
) => {
	const [src, setSrc] = useState<R | undefined>(undefined);

	const graph = client.live.graph();

	const cb = React.useCallback(
		(x: R) => {
			if (JSON.stringify(src) !== JSON.stringify(x)) {
				setSrc(x);
			}
		},
		[src],
	);

	React.useLayoutEffect(() => {
		if (graph) {
			const sub = fasterQuery<T, R>(graph, query, variables, formatter).subscribe(
				cb,
				() => null,
			);
			return () => {
				sub.unsubscribe();
			};
		}
		return undefined;
	}, [variables, query, graph]);

	return src;
};

export const useFastQuery = <T, R>(
	query: DocumentNode,
	variables: object,
	formatter: (res: ApolloQueryResult<T>) => R,
) => {
	const [src, setSrc] = useState<R | undefined>(undefined);

	const graph = client.live.graph();

	const cb = React.useCallback(
		(x: R) => {
			if (JSON.stringify(src) !== JSON.stringify(x)) {
				setSrc(x);
			}
		},
		[src],
	);

	React.useLayoutEffect(() => {
		try {
			if (graph) {
				const sub = fastQuery<T, R>(graph, query, variables, formatter).subscribe(
					cb,
					() => null,
				);
				return () => {
					sub.unsubscribe();
				};
			}
		} catch {
			setSrc(undefined);
		}
		return undefined;
	}, [variables, query, graph]);

	return src;
};
