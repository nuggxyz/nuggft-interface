import gql from 'graphql-tag';

import { executeQuery3 } from '@src/graphql/helpers';
import { isUndefinedOrNullOrStringEmpty } from '@src/lib';
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
        const result = await executeQuery3<{ nuggs: { id: string }[] }>(
            // chainId,
            query(orderDirection, searchValue, first, skip),
            {},
        );

        return result.nuggs ?? [];
    } catch (e: unknown) {
        throw new Error(`allnuggsquery ${e as string}`);
    }
};

export default allNuggsQuery;
