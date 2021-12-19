import constants from './constants';
// import fetch from 'node-fetch';

import { createHttpLink } from 'apollo-link-http';
import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';

export const client = new ApolloClient({
    link: createHttpLink({
        uri: constants.MAIN_ENDPOINT,
        fetch: fetch as any,
    }),
    cache: new InMemoryCache(),
});

export const healthClient = new ApolloClient({
    link: createHttpLink({
        uri: constants.HEALTH_ENDPOINT,
        fetch: fetch as any,
    }),
    cache: new InMemoryCache(),
});

export const blockClient = new ApolloClient({
    link: createHttpLink({
        uri: constants.BLOCK_ENDPOINT,
        fetch: fetch as any,
    }),
    queryDeduplication: true,
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'no-cache',
        },
        query: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'all',
        },
    },
    cache: new InMemoryCache({}),
});
