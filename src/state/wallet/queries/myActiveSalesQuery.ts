import gql from 'graphql-tag';

import { idFragment } from '../../../graphql/fragments/general';
import {
    swapNuggId,
    swapThumbnail,
    swapThumbnailActiveSales,
} from '../../../graphql/fragments/swap';
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
        ) {
            id
            endingEpoch
            eth
            ethUsd
            offers(first: 1, orderBy: eth, orderDirection: desc, where: {claimed: false, user: "${address}"}) {
                id
            }
            owner ${idFragment}
            leader ${idFragment}
            nugg ${idFragment}
        }
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
        )) as NL.GraphQL.Fragments.Swap.ThumbnailActiveSales[];
        return !isUndefinedOrNullOrArrayEmpty(result)
            ? result.filter(
                  (swap) => !isUndefinedOrNullOrArrayEmpty(swap.offers),
              )
            : [];
    } catch (e) {
        throw new Error(`activeNuggsQuery: ${e}`);
    }
};

export default myActiveSalesQuery;
