import gql from 'graphql-tag';

import { swapNuggId } from '../../../graphql/fragments/swap';
import { executeQuery } from '../../../graphql/helpers';
import { isUndefinedOrNullOrArrayEmpty } from '../../../lib';

const query = (
    orderBy: 'eth' | 'id',
    orderDirection: 'asc' | 'desc',
    searchValue: string,
    first: number,
    skip: number,
) => gql`
    {
        swaps(
            where: {nugg_contains: "${searchValue}"},
            orderBy: ${orderBy === 'id' ? 'endingEpoch' : 'eth'},
            orderDirection: ${orderDirection},
            first: ${first},
            skip: ${skip}
        ) ${swapNuggId}
    }
`;

const allNuggsQuery = async (
    orderBy: 'eth' | 'id',
    orderDirection: 'asc' | 'desc',
    searchValue: string,
    first: number,
    skip: number,
) => {
    try {
        const result = (await executeQuery(
            query(orderBy, orderDirection, searchValue, first, skip),
            'swaps',
        )) as Promise<NL.GraphQL.Fragments.Swap.NuggId[]>;
        return !isUndefinedOrNullOrArrayEmpty(result) ? result : [];
    } catch (e) {
        throw new Error(`allNuggsQuery: ${e}`);
    }
};

export default allNuggsQuery;
