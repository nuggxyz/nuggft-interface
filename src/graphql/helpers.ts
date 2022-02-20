import { isUndefinedOrNullOrObjectEmpty } from '../lib';
import { client } from './client';
import GQLHelper from './GQLHelper';

export const executeQuery = async (query: any, tableName: string) => {
    try {
        const result = await GQLHelper.instance.query({
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
