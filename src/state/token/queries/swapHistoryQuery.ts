import gql from 'graphql-tag';

import { swapThumbnail } from '../../../graphql/fragments/swap';
import { executeQuery } from '../../../graphql/helpers';
import { isUndefinedOrNullOrArrayEmpty, isUndefinedOrNullOrStringEmpty } from '../../../lib';
import { SupportedChainId } from '../../web32/config';

const query = (id: string, orderDirection: 'asc' | 'desc', first: number, skip: number) => gql`
    {
        swaps (
            ${!isUndefinedOrNullOrStringEmpty(id) ? `where: {nugg: "${id}"}` : ''}
            orderBy: id
            orderDirection: ${orderDirection},
            first: ${first},
            skip: ${skip}
        ) ${swapThumbnail}
    }
`;

const swapHistoryQuery = async (
    chainId: SupportedChainId,
    id: string,
    orderDirection: 'asc' | 'desc',
    first: number,
    skip: number,
) => {
    try {
        const result = (await executeQuery(
            chainId,
            query(id, orderDirection, first, skip),
            'swaps',
        )) as Promise<NL.GraphQL.Fragments.Swap.Thumbnail[]>;
        return !isUndefinedOrNullOrArrayEmpty(result) ? result : [];
    } catch (e) {
        throw new Error(`swapHistoryQuery: ${e}`);
    }
};

export default swapHistoryQuery;
