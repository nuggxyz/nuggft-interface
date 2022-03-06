import gql from 'graphql-tag';

import { nuggThumbnail } from '@src/graphql/fragments/nugg';
import { executeQuery3 } from '@src/graphql/helpers';
import { Chain } from '@src/web3/core/interfaces';
import { itemThumbnail } from '@src/graphql/fragments/item';
import { extractItemId } from '@src/lib';

const query = gql`
    query nuggThumbnail($id: ID!) {
        nugg (id: $id) ${nuggThumbnail}
    }
`;

const itemQuery = gql`
    query itemThumbnail($id: ID!) {
        item (id: $id) ${itemThumbnail}
    }
`;

const nuggThumbnailQuery = async (chainId: Chain, id: string, isItem: boolean) => {
    try {
        let res: NL.GraphQL.Fragments.Nugg.Thumbnail;
        if (isItem) {
            let tmp = (
                await executeQuery3<{ item: NL.GraphQL.Fragments.Item.ThumbnailFull }>(itemQuery, {
                    id: extractItemId(id),
                })
            ).item;
            res = {
                user: tmp.swaps[0].owner,
                ...tmp,
            } as unknown as NL.GraphQL.Fragments.Nugg.Thumbnail;
        } else {
            res = (
                await executeQuery3<{ nugg: NL.GraphQL.Fragments.Nugg.Thumbnail }>(query, { id })
            ).nugg;
        }
        return res;
    } catch (e) {
        throw new Error(`nuggThumbnailQuery: ${e}`);
    }
};

export default nuggThumbnailQuery;
