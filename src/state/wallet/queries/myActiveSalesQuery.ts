import gql from 'graphql-tag';

import { idFragment } from '@src/graphql/fragments/general';
import { executeQuery } from '@src/graphql/helpers';
import { isUndefinedOrNullOrArrayEmpty, isUndefinedOrNullOrStringEmpty } from '@src/lib';
import { SupportedChainId } from '@src/state/web32/config';

const query = (
    address: string,
    orderDirection: 'asc' | 'desc',
    searchValue: string,
    first: number,
    skip: number,
) => gql`
    {
        swaps(
            where: {owner: "${address}", ${
    !isUndefinedOrNullOrStringEmpty(searchValue) ? `nugg_contains: "${searchValue}"` : ''
}},
            orderBy: endingEpoch,
            orderDirection: ${orderDirection},
            first: ${first},
            skip: ${skip}
        ) {
            id
            endingEpoch
            num
            eth
            ethUsd
            offers(first: 1, orderBy: eth, orderDirection: desc, where: {claimed: false, user: "${address}"}) {
                id
            }
            owner ${idFragment}
            leader ${idFragment}
            nugg {
                id
                dotnuggRawCache
            }
        }
    }
`;

const myActiveSalesQuery = async (
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
            'swaps',
        )) as NL.GraphQL.Fragments.Swap.ThumbnailActiveSales[];
        return !isUndefinedOrNullOrArrayEmpty(result)
            ? result.filter((swap) => !isUndefinedOrNullOrArrayEmpty(swap.offers))
            : [];
    } catch (e) {
        throw new Error(`activeNuggsQuery: ${e}`);
    }
};

export default myActiveSalesQuery;
