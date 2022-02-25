import gql from 'graphql-tag';

import { offerBare } from '@src/graphql/fragments/offer';
import { executeQuery } from '@src/graphql/helpers';
import { SupportedChainId } from '@src/state/web32/config';

const query = (id: string) => gql`
    {
        swap(id: "${id}") {
            offers (orderBy: eth, orderDirection: desc) ${offerBare}
        }
    }
`;

const pollOffersQuery = async (chainId: SupportedChainId, swapId: string) => {
    return (await executeQuery(chainId, query(swapId), 'swap')).offers as Promise<
        NL.GraphQL.Fragments.Offer.Bare[]
    >;
};

export default pollOffersQuery;
