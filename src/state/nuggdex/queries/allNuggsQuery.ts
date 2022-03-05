import gql from 'graphql-tag';

import { executeQuery } from '@src/graphql/helpers';
import { isUndefinedOrNullOrArrayEmpty, isUndefinedOrNullOrStringEmpty } from '@src/lib';
import { Chain } from '@src/web3/core/interfaces';

const query = (
    orderBy: 'eth' | 'id',
    orderDirection: 'asc' | 'desc',
    searchValue: string,
    first: number,
    skip: number,
    epoch: number,
) => gql`
    {
        nuggs(
            where: {idnum_lte: ${epoch} ${
    !isUndefinedOrNullOrStringEmpty(searchValue) ? `,id: "${searchValue}"` : ''
}},
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
    chainId: Chain,
    orderBy: 'eth' | 'id',
    orderDirection: 'asc' | 'desc',
    searchValue: string,
    first: number,
    skip: number,
    epoch: number,
) => {
    try {
        const result = (await executeQuery(
            chainId,
            query(orderBy, orderDirection, searchValue, first, skip, epoch),
            'nuggs',
        )) as NL.GraphQL.Fragments.Nugg.ListItem[];
        return !isUndefinedOrNullOrArrayEmpty(result) ? result : [];
    } catch (e) {
        throw new Error(`allNuggsQuery: ${e}`);
    }
};

export default allNuggsQuery;
