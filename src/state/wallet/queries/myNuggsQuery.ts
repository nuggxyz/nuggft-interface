import gql from 'graphql-tag';

import { executeQuery } from '../../../graphql/helpers';
import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../../lib';
import { SupportedChainId } from '../../web32/config';

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
    chainId: SupportedChainId,
    address: string,
    orderDirection: 'asc' | 'desc',
    searchValue: string,
    first: number,
    skip: number,
) => {
    try {
        const result = (await executeQuery(
            chainId,
            query(address.toLowerCase(), orderDirection, searchValue, first, skip),
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
