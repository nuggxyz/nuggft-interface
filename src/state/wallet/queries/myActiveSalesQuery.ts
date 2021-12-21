import gql from 'graphql-tag';

import { swapNuggId, swapThumbnail } from '../../../graphql/fragments/swap';
import { executeQuery } from '../../../graphql/helpers';
import { isUndefinedOrNullOrArrayEmpty } from '../../../lib';

const query = (
    address: string,
    orderDirection: 'asc' | 'desc',
    searchValue: string,
    first: number,
    skip: number,
) => gql`
    {
        swaps(
            where: {owner: "${address}", nugg_contains: "${searchValue}"},
            orderBy: endingEpoch,
            orderDirection: ${orderDirection},
            first: ${first},
            skip: ${skip}
        ) ${swapThumbnail}
    }
`;

const myActiveSalesQuery = async (
    address: string,
    orderDirection: 'asc' | 'desc',
    searchValue: string,
    first: number,
    skip: number,
) => {
    try {
        const result = (await executeQuery(
            query(address, orderDirection, searchValue, first, skip),
            'swaps',
        )) as NL.GraphQL.Fragments.Swap.Thumbnail[];
        return !isUndefinedOrNullOrArrayEmpty(result) ? result : [];
    } catch (e) {
        throw new Error(`activeNuggsQuery: ${e}`);
    }
};

export default myActiveSalesQuery;
