import { ApolloClient, ApolloQueryResult, DocumentNode } from '@apollo/client';
import client from '@src/client';
import React, { useState } from 'react';
import { isUndefinedOrNullOrObjectEmpty } from '../lib';
import GQLHelper from './GQLHelper';

export const executeQuery = async (chainId: number, query: any, tableName: string) => {
    try {
        const result = await GQLHelper.instance(chainId).query({
            query,
            fetchPolicy: 'no-cache',
        });

        if (
            !isUndefinedOrNullOrObjectEmpty(result) &&
            !isUndefinedOrNullOrObjectEmpty(result.data) &&
            tableName in result.data
        ) {
            return result.data[tableName];
        }
    } catch (error) {
        throw new Error(error.message);
    }
};

export const executeQuery2 = async (client: ApolloClient<any>, query: any, tableName: string) => {
    try {
        const result = await client.query({
            query,
            fetchPolicy: 'no-cache',
        });

        if (
            !isUndefinedOrNullOrObjectEmpty(result) &&
            !isUndefinedOrNullOrObjectEmpty(result.data) &&
            tableName in result.data
        ) {
            return result.data[tableName];
        }
    } catch (error) {
        throw new Error(error.message);
    }
};

export const executeQuery3 = async <T>(query: DocumentNode, variables: object) => {
    try {
        const result = await client.static.apollo().query<T>({
            query,
            fetchPolicy: 'no-cache',
            canonizeResults: true,
            notifyOnNetworkStatusChange: true,
            variables: variables,
        });

        if (result && result.data) {
            return result.data;
        }
        throw new Error('executeQuery3 failed');
    } catch (error) {
        throw new Error(error.message);
    }
};

export const executeQuery4 = async <T>(query: DocumentNode, variables: object) => {
    try {
        const result = await client.static.apollo().query<T>({
            query,
            // @ts-ignore
            // fetchPolicy: 'cache-and-network',
            fetchPolicy: 'cache-first',
            canonizeResults: true,
            notifyOnNetworkStatusChange: true,
            variables: variables,
        });

        if (result && result.data) {
            return result.data;
        }
        throw new Error('executeQuery3 failed');
    } catch (error) {
        throw new Error(error.message);
    }
};

export const executeQuery5 = <T>(query: DocumentNode, variables: object) => {
    return client.static.apollo().watchQuery<T>({
        query,
        // @ts-ignore
        fetchPolicy: 'cache-and-network',
        canonizeResults: true,
        notifyOnNetworkStatusChange: true,
        variables: variables,
    });
};

export const executeQuery6 = <T>(query: DocumentNode, variables: object) => {
    return client.static.apollo().watchQuery<T>({
        query,
        fetchPolicy: 'cache-first',
        canonizeResults: true,
        notifyOnNetworkStatusChange: true,
        variables: variables,
    });
};

export const fasterQuery = <T, R>(
    query: DocumentNode,
    variables: object,
    formatter: (res: ApolloQueryResult<T>) => R,
) => {
    const a = executeQuery6<T>(query, variables);
    return a.map(formatter);
};

export const fastQuery = <T, R>(
    query: DocumentNode,
    variables: object,
    formatter: (res: ApolloQueryResult<T>) => R,
) => {
    const a = executeQuery5<T>(query, variables);
    return a.map(formatter);
};

export const useFasterQuery = <T, R>(
    query: DocumentNode,
    variables: object,
    formatter: (res: ApolloQueryResult<T>) => R,
) => {
    const [src, setSrc] = useState<R>(undefined);

    const cb = React.useCallback(
        (x) => {
            if (JSON.stringify(src) !== JSON.stringify(x)) {
                setSrc(x);
            }
        },
        [src],
    );

    React.useEffect(() => {
        const sub = fasterQuery<T, R>(query, variables, formatter).subscribe(cb, () => null);

        return () => {
            sub.unsubscribe();
        };
    }, [variables, query]);

    return src;
};

export const useFastQuery = <T, R>(
    query: DocumentNode,
    variables: object,
    formatter: (res: ApolloQueryResult<T>) => R,
) => {
    const [src, setSrc] = useState<R>(undefined);

    const cb = React.useCallback(
        (x) => {
            if (JSON.stringify(src) !== JSON.stringify(x)) {
                setSrc(x);
            }
        },
        [src],
    );

    React.useEffect(() => {
        const sub = fastQuery<T, R>(query, variables, formatter).subscribe(cb, () => null);

        return () => {
            sub.unsubscribe();
        };
    }, [variables, query]);

    return src;
};
