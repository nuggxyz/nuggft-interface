import gql from 'graphql-tag';

import { swapBare, swapBareWithEpoch } from '../../../graphql/fragments/swap';
import { executeQuery } from '../../../graphql/helpers';

const query = (id: string) => gql`
    {
        swap(id: "${id}") ${swapBareWithEpoch}
    }
`;

const initSwapQuery = async (id: string) => {
    return (await executeQuery(
        query(id),
        'swap',
    )) as Promise<NL.GraphQL.Fragments.Swap.Bare>;
};

export default initSwapQuery;
