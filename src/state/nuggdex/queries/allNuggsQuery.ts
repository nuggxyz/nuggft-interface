import gql from 'graphql-tag';

import { idFragment } from '../../../graphql/fragments/general';
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
        nuggs(
            where: {${searchValue ? `id: "${searchValue}"` : ''}},
            orderBy: id,
            orderDirection: ${orderDirection},
            first: ${first},
            skip: ${skip}
        ) ${idFragment}
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
            'nuggs',
        )) as NL.GraphQL.Fragments.General.Id[];
        return !isUndefinedOrNullOrArrayEmpty(result)
            ? result.map((res) => res.id)
            : [];
    } catch (e) {
        throw new Error(`allNuggsQuery: ${e}`);
    }
};

export default allNuggsQuery;
