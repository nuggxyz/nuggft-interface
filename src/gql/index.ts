/* eslint-disable no-unneeded-ternary */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
import { getMainDefinition } from '@apollo/client/utilities';
import { split, HttpLink, InMemoryCache } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';

import client from '@src/client';

import { StrictTypedTypePolicies } from './types.generated';

// // // await before instantiating ApolloClient, else queries might run before the cache is persisted
// void persistCache({
//     cache,
//     storage: new LocalStorageWrapper(window.localStorage),
//     debug: true,
//     trigger: 'write',
//     // serialize: true,
//     // persistenceMapper: async (data: string) => {
//     //     // filter your cached data and queries
//     //     // console.log(JSON.parse(data));

//     //     // Object.entries(data).forEach((x) => {
//     //     // });
//     //     // eslint-disable-next-line @typescript-eslint/no-unsafe-return
//     //     // if (typeof data === 'string') return JSON.parse(data);
//     //     return data;
//     // },
// });

export const buildApolloHttpLink = (http: string) => {
	const { generateApolloResponseErrorMiddleware, generateApolloResponseMiddleware } =
		client.health.getState();

	return generateApolloResponseMiddleware().concat(
		generateApolloResponseErrorMiddleware().concat(
			new HttpLink({
				uri: http,
				fetch,
			}),
		),
	);
};

export const buildApolloSplitLink = (http: string, wss: string) => {
	const { generateApolloResponseErrorMiddleware, generateApolloResponseMiddleware } =
		client.health.getState();

	return generateApolloResponseMiddleware().concat(
		generateApolloResponseErrorMiddleware().concat(
			split(
				({ query }) => {
					const definition = getMainDefinition(query);

					return (
						definition.kind === 'OperationDefinition' &&
						definition.operation === 'subscription'
					);
				},
				new WebSocketLink({
					uri: wss,
					options: {
						reconnect: true,
						timeout: 50000,
						minTimeout: 30000,
						// wsOptionArguments: {

						// },
						reconnectionAttempts: 100,
						// lazy: true,
					},

					webSocketImpl: WebSocket,
				}),
				buildApolloHttpLink(http),
			),
		),
	);
};

const typePolicies: StrictTypedTypePolicies = {
	Query: {
		fields: {
			// nugg: {
			//     // keyArgs: ['id'],
			//     // read: (x, b) => {
			//     //     console.log({ x, b });
			//     // },
			//     // merge: (x, b) => {
			//     //     console.log({ x, b });
			//     // },
			// },
			// item: {
			//     // keyArgs: ,
			//     // read: (x, b) => {
			//     //     console.log({ x, b });
			//     // },
			//     // merge: (x, b) => {
			//     //     console.log({ x, b });
			//     // },
			// },
			// nuggs: {
			//     // Don't cache separate results based on
			//     // any of this field's arguments.
			//     keyArgs: false,
			//     // Concatenate the incoming list items with
			//     // the existing list items.
			//     // eslint-disable-next-line @typescript-eslint/default-param-last
			//     merge(existing = [], incoming) {
			//         // eslint-disable-next-line @typescript-eslint/no-unsafe-return
			//         return [...existing, ...incoming];
			//     },
			// },
			// items: {
			//     // Don't cache separate results based on
			//     // any of this field's arguments.
			//     keyArgs: false,
			//     // Concatenate the incoming list items with
			//     // the existing list items.
			//     // eslint-disable-next-line @typescript-eslint/default-param-last
			//     merge(existing: Array<any> = [], incoming: Array<any>) {
			//         // eslint-disable-next-line @typescript-eslint/no-unsafe-return
			//         return [...existing, ...incoming];
			//     },
			// },
		},
	},
};
export const buildCache = () => {
	return new InMemoryCache({
		typePolicies,
	});
};
