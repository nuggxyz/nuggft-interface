import constants from './constants';
// import fetch from 'node-fetch';

// import { createHttpLink } from 'apollo-link-http';
// import ApolloClient from 'apollo-client';
// import { InMemoryCache } from 'apollo-cache-inmemory';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { split, ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

import store, { states } from '../state/store';
import config, { SupportedChainId } from '../state/web32/config';

const wsLink = new WebSocketLink({
    uri: constants.MAIN_WEBSOCKET,
    options: {
        reconnect: true,
        timeout: 30000,
        minTimeout: 30000,
        reconnectionAttempts: 100,
    },
});

const fetchLogger = (url, init) => {
    console.log(init.body);
    return fetch(url, init).then((response) => response);
};

// // const httpLink =

// const splitLink = split(
//     ({ query }) => {
//         const definition = getMainDefinition(query);
//         return (
//             definition.kind === 'OperationDefinition' &&
//             definition.operation === 'subscription'
//         );
//     },
//     wsLink,
//     httpLink,
// );

export const client = (chainId: SupportedChainId): ApolloClient<any> => {
    console.log('NEW CLIENT');
    console.trace();
    return new ApolloClient({
        link: new HttpLink({
            // uri: config.GRAPH_ENPOINTS[store.getState().web3.currentChain],
            uri: config.GRAPH_ENPOINTS[chainId],
            fetch: fetch as any,
        }),
        cache: new InMemoryCache(),
    });
};

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
