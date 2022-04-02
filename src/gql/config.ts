/* eslint-disable @typescript-eslint/require-await */
import { getMainDefinition } from '@apollo/client/utilities';
import { split, HttpLink, InMemoryCache } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';

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

const cache = new InMemoryCache({});

export const buildApolloSplitLink = (http: string, wss: string) => {
    return split(
        ({ query }) => {
            const definition = getMainDefinition(query);

            return (
                definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
            );
        },
        new WebSocketLink({
            uri: wss,
            options: {
                reconnect: true,
                timeout: 120000,
                minTimeout: 30000,
                reconnectionAttempts: 100,
                lazy: true,
            },
            webSocketImpl: WebSocket,
        }),
        new HttpLink({
            uri: http,
            fetch,
        }),
    );
};

export const buildCache = () => {
    return cache;
};
