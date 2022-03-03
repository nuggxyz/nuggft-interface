import gql from 'graphql-tag';

import { nuggThumbnail } from '@src/graphql/fragments/nugg';
import { executeQuery } from '@src/graphql/helpers';
import { Chain } from '@src/web3/core/interfaces';

const query = (id: string) => gql`
    {
        nugg(id: "${id}") ${nuggThumbnail}
    }
`;

const getNuggThumbnailQuery = async (chainId: Chain, id: string) => {
    try {
        return (await executeQuery(
            chainId,
            query(id),
            'nugg',
        )) as Promise<NL.GraphQL.Fragments.Nugg.Thumbnail>;
    } catch (e) {
        throw new Error(`getNuggThumbnailQuery: ${e}`);
    }
};

export default getNuggThumbnailQuery;
