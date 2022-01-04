import gql from 'graphql-tag';

import config from '../../../config';
import { swapNuggId } from '../../../graphql/fragments/swap';
import { executeQuery } from '../../../graphql/helpers';
import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../../lib';

const query = (
    orderBy: 'eth' | 'id',
    orderDirection: 'asc' | 'desc',
    searchValue: string,
    currentEpoch: string,
    first: number,
    skip: number,
) => gql`
    {
        protocol (id: "${config.NUGG_PROTOCOL}") {
            activeNuggs (
                ${
                    !isUndefinedOrNullOrStringEmpty(searchValue)
                        ? `where: {id: ${searchValue}}`
                        : ''
                }
                first: ${first},
                skip: ${skip},
                orderBy: idnum,
                orderDirection: ${orderDirection}
            ) {
                id
                dotnuggRawCache
            }
        }
    }
`;

// const query2 = (
//     orderBy: 'eth' | 'id',
//     orderDirection: 'asc' | 'desc',
//     searchValue: string,
//     first: number,
//     skip: number,
// ) => gql`
//     {
//         swaps(
//             where: {endingEpoch: "0", id_not:"0-0", nugg_contains: "${searchValue}"},
//             orderBy: ${orderBy === 'id' ? 'endingEpoch' : 'eth'},
//             orderDirection: ${orderDirection},
//             first: ${first},
//             skip: ${skip}
//         ) ${swapNuggId}
//     }
// `;

const activeNuggsQuery = async (
    orderBy: 'eth' | 'id',
    orderDirection: 'asc' | 'desc',
    searchValue: string,
    currentEpoch: string,
    first: number,
    skip: number,
) => {
    try {
        const result = (await executeQuery(
            query(
                orderBy,
                orderDirection,
                searchValue,
                currentEpoch,
                first,
                skip,
            ),
            'protocol',
        )) as NL.GraphQL.Fragments.Protocol.Actives;
        // const result2 = (await executeQuery(
        //     query2(orderBy, orderDirection, searchValue, first, skip),
        //     'swaps',
        // )) as NL.GraphQL.Fragments.Swap.NuggId[];
        return !isUndefinedOrNullOrArrayEmpty(result.activeNuggs)
            ? (result.activeNuggs as NL.GraphQL.Fragments.Nugg.ListItem[])
            : [];
    } catch (e) {
        throw new Error(`activeNuggsQuery: ${e}`);
    }
};

export default activeNuggsQuery;
