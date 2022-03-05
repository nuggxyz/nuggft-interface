import gql from 'graphql-tag';

import { swapBareWithEpoch } from '@src/graphql/fragments/swap';
import { executeQuery } from '@src/graphql/helpers';
import { Chain } from '@src/web3/core/interfaces';

const query = (id: string) => gql`
    {
        swap(id: "${id}") ${swapBareWithEpoch}
    }
`;

const initSwapQuery = async (chainId: Chain, id: string) => {
    return (await executeQuery(
        chainId,
        query(id),
        'swap',
    )) as Promise<NL.GraphQL.Fragments.Swap.Bare>;
};

export default initSwapQuery;
