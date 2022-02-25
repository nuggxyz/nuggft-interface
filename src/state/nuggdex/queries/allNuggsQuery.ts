import gql from 'graphql-tag';

import { executeQuery } from '../../../graphql/helpers';
import { isUndefinedOrNullOrArrayEmpty, isUndefinedOrNullOrStringEmpty } from '../../../lib';
import { SupportedChainId } from '../../web32/config';

const query = (
    orderBy: 'eth' | 'id',
    orderDirection: 'asc' | 'desc',
    searchValue: string,
    first: number,
    skip: number,
) => gql`
    {
        nuggs(
            ${!isUndefinedOrNullOrStringEmpty(searchValue) ? `where: {id: "${searchValue}"},` : ''}
            orderBy: idnum,
            orderDirection: ${orderDirection},
            first: ${first},
            skip: ${skip}
        ) {
            id
            dotnuggRawCache
        }
    }
`;

const allNuggsQuery = async (
    chainId: SupportedChainId,
    orderBy: 'eth' | 'id',
    orderDirection: 'asc' | 'desc',
    searchValue: string,
    first: number,
    skip: number,
) => {
    try {
        const result = (await executeQuery(
            chainId,
            query(orderBy, orderDirection, searchValue, first, skip),
            'nuggs',
        )) as NL.GraphQL.Fragments.Nugg.ListItem[];
        return !isUndefinedOrNullOrArrayEmpty(result) ? result : [];
    } catch (e) {
        throw new Error(`allNuggsQuery: ${e}`);
    }
};

export default allNuggsQuery;
