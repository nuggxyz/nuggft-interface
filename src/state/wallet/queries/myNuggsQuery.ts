import gql from 'graphql-tag';

import { idFragment } from '../../../graphql/fragments/general';
import { executeQuery } from '../../../graphql/helpers';
import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../../lib';

const query = (
    address: string,
    orderDirection: 'asc' | 'desc',
    searchValue: string,
    first: number,
    skip: number,
) => gql`
    {
        user(id: "${address}") {
            nuggs (
                ${
                    !isUndefinedOrNullOrStringEmpty(searchValue)
                        ? `where: {id: "${searchValue}"},`
                        : ''
                }
                orderBy: idnum,
                orderDirection: ${orderDirection},
                first: ${first},
                skip: ${skip}
            ) {
                id
                dotnuggRawCache
            }
        }
    }
`;

const myNuggsQuery = async (
    address: string,
    orderDirection: 'asc' | 'desc',
    searchValue: string,
    first: number,
    skip: number,
) => {
    try {
        const result = (await executeQuery(
            query(address, orderDirection, searchValue, first, skip),
            'user',
        )) as NL.GraphQL.Fragments.User.Bare;

        return !isUndefinedOrNullOrObjectEmpty(result) &&
            !isUndefinedOrNullOrArrayEmpty(result.nuggs)
            ? (result.nuggs as NL.GraphQL.Fragments.Nugg.ListItem[])
            : [];
    } catch (e) {
        throw new Error(`myNuggsQuery: ${e}`);
    }
};

export default myNuggsQuery;
