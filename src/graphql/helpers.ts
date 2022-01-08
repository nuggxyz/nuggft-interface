import { isUndefinedOrNullOrObjectEmpty } from '../lib';
import { client } from './client';

export const executeQuery = async (query: any, tableName: string) => {
    try {
        const result = await client().query({
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
