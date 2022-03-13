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
    } catch (e: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        // eslint-disable-next-line no-template-curly-in-string
        throw new Error('allnuggsquery ${e}');
    }
};

export default allNuggsQuery;
