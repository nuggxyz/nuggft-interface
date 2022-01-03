import constants from './constants';
// import fetch from 'node-fetch';

// import { createHttpLink } from 'apollo-link-http';
// import ApolloClient from 'apollo-client';
// import { InMemoryCache } from 'apollo-cache-inmemory';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { split, ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const wsLink = new WebSocketLink({
    uri: constants.MAIN_WEBSOCKET,
    options: {
        reconnect: true,
        timeout: 30000,
        minTimeout: 30000,
        reconnectionAttempts: 100,
    },
});

const httpLink = new HttpLink({
    uri: constants.MAIN_ENDPOINT,
    // fetch: fetch as any,
});

const splitLink = split(
    ({ query }) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        );
    },
    wsLink,
    httpLink,
);

export const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
});

export const subs = new ApolloClient({
    link: wsLink,
    cache: new InMemoryCache(),
});

// export const healthClient = new ApolloClient({
//     link: createHttpLink({
//         uri: constants.HEALTH_ENDPOINT,
//         fetch: fetch as any,
//     }),
//     cache: new InMemoryCache(),
// });

// export const blockClient = new ApolloClient({
//     link: createHttpLink({
//         uri: constants.BLOCK_ENDPOINT,
//         fetch: fetch as any,
//     }),
//     queryDeduplication: true,
//     defaultOptions: {
//         watchQuery: {
//             fetchPolicy: 'no-cache',
//         },
//         query: {
//             fetchPolicy: 'no-cache',
//             errorPolicy: 'all',
//         },
//     },
//     cache: new InMemoryCache({}),
// });
