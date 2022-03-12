import gql from 'graphql-tag';

import { executeQuery } from '@src/graphql/helpers';
import { isUndefinedOrNullOrArrayEmpty, isUndefinedOrNullOrStringEmpty } from '@src/lib';
import { Chain } from '@src/web3/core/interfaces';

const query = (
    orderDirection: 'asc' | 'desc',
    searchValue: string,
    first: number,
    skip: number,
) => gql`
    {
        nuggs(
            where: { ${
                !isUndefinedOrNullOrStringEmpty(searchValue) ? `,id: "${searchValue}"` : ''
            }},
            orderBy: idnum,
            orderDirection: ${orderDirection},
            first: ${first},
            skip: ${skip}
        ) {
            id
        }
    }
`;

const allNuggsQuery = async (
    chainId: Chain,
    orderDirection: 'asc' | 'desc',
    searchValue: string,
    first: number,
    skip: number,
) => {
    try {
        const result = (await executeQuery(
            chainId,
            query(orderDirection, searchValue, first, skip),
            'nuggs',
        )) as NL.GraphQL.Fragments.Nugg.ListItem[];
        return !isUndefinedOrNullOrArrayEmpty(result) ? result : [];
    } catch (e) {
        throw new Error(`allNuggsQuery: ${e}`);
    }
};

export default allNuggsQuery;
