import { ApolloClient, DocumentNode } from '@apollo/client';
import client from '@src/client';
import { isUndefinedOrNullOrObjectEmpty } from '../lib';
import GQLHelper from './GQLHelper';

export const executeQuery = async (chainId: number, query: any, tableName: string) => {
    try {
        console.log({ chainId, query, tableName });
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
