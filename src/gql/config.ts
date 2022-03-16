import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { split, InMemoryCache, HttpLink } from '@apollo/client';

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
                timeout: 60000,
                minTimeout: 30000,
                reconnectionAttempts: 100,
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
    return new InMemoryCache({});
};