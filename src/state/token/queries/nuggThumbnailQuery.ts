import gql from 'graphql-tag';

import { nuggThumbnail } from '@src/graphql/fragments/nugg';
import { executeQuery } from '@src/graphql/helpers';
import { SupportedChainId } from '@src/state/web32/config';

const query = (id: string) => gql`
    {
        nugg (id: "${id}") ${nuggThumbnail}
    }
`;

const nuggThumbnailQuery = async (chainId: SupportedChainId, id: string) => {
    try {
        return (await executeQuery(
            chainId,
            query(id),
            'nugg',
        )) as Promise<NL.GraphQL.Fragments.Nugg.Thumbnail>;
    } catch (e) {
        throw new Error(`nuggThumbnailQuery: ${e}`);
    }
};

export default nuggThumbnailQuery;
