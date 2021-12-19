import gql from 'graphql-tag';

import { nuggThumbnail } from '../../../graphql/fragments/nugg';
import { executeQuery } from '../../../graphql/helpers';

const query = (id: string) => gql`
    {
        nugg(id: "${id}") ${nuggThumbnail}
    }
`;

const getNuggThumbnailQuery = async (id: string) => {
    try {
        return (await executeQuery(
            query(id),
            'nugg',
        )) as Promise<NL.GraphQL.Fragments.Nugg.Thumbnail>;
    } catch (e) {
        throw new Error(`getNuggThumbnailQuery: ${e}`);
    }
};

export default getNuggThumbnailQuery;
