import gql from 'graphql-tag';

import { swapBareWithEpoch } from '../../../graphql/fragments/swap';
import { executeQuery } from '../../../graphql/helpers';
import { SupportedChainId } from '../../web32/config';

const query = (id: string) => gql`
    {
        swap(id: "${id}") ${swapBareWithEpoch}
    }
`;

const initSwapQuery = async (chainId: SupportedChainId, id: string) => {
    return (await executeQuery(
        chainId,
        query(id),
        'swap',
    )) as Promise<NL.GraphQL.Fragments.Swap.Bare>;
};

export default initSwapQuery;
