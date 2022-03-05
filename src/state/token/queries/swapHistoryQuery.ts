import gql from 'graphql-tag';

import { swapThumbnail } from '@src/graphql/fragments/swap';
import { executeQuery3 } from '@src/graphql/helpers';
import { isUndefinedOrNullOrArrayEmpty } from '@src/lib';
import { Chain } from '@src/web3/core/interfaces';
import { itemSwapThumbnail } from '@src/graphql/fragments/itemSwap';

const query = gql`
    query swapHistoryQuery($nuggId: ID!, $orderDirection: OrderDirection!, $first: Int!, $skip: Int!) {
        swaps (
            where: {nugg: $nuggId},
            orderBy: id,
            orderDirection: $orderDirection,
            first: $first,
            skip: $skip
        ) ${swapThumbnail}
    }
`;

const itemsQuery = gql`
    query swapHistoryQuery($itemId: ID!, $orderDirection: OrderDirection!, $first: Int!, $skip: Int!) {
        itemSwaps (
            where: {sellingItem: $itemId},
            orderBy: id,
            orderDirection: $orderDirection,
            first: $first,
            skip: $skip
        ) ${itemSwapThumbnail}
    }
`;

const swapHistoryQuery = async (
    chainId: Chain,
    id: string,
    orderDirection: 'asc' | 'desc',
    first: number,
    skip: number,
    isItem: boolean,
) => {
    try {
        if (isItem) {
            const result = await executeQuery3<{
                itemSwaps: NL.GraphQL.Fragments.ItemSwap.Thumbnail[];
            }>(itemsQuery, { itemId: id, orderDirection, first, skip });
            return !isUndefinedOrNullOrArrayEmpty(result?.itemSwaps) ? result.itemSwaps : [];
        } else {
            const result = await executeQuery3<{ swaps: NL.GraphQL.Fragments.Swap.Thumbnail[] }>(
                query,
                { nuggId: id, orderDirection, first, skip },
            );
            return !isUndefinedOrNullOrArrayEmpty(result?.swaps) ? result.swaps : [];
        }
    } catch (e) {
        throw new Error(`swapHistoryQuery: ${e}`);
    }
};

export default swapHistoryQuery;
