import gql from 'graphql-tag';

import { nuggThumbnail } from '../../../graphql/fragments/nugg';
import { executeQuery } from '../../../graphql/helpers';

const query = (id: string) => gql`
    {
        nugg (id: "${id}") ${nuggThumbnail}
    }
`;

const nuggThumbnailQuery = async (id: string) => {
    try {
        return (await executeQuery(
            query(id),
            'nugg',
        )) as Promise<NL.GraphQL.Fragments.Nugg.Thumbnail>;
    } catch (e) {
        throw new Error(`nuggThumbnailQuery: ${e}`);
    }
};

export default nuggThumbnailQuery;
