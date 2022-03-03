import gql from 'graphql-tag';

import { offerBare } from '@src/graphql/fragments/offer';
import { executeQuery } from '@src/graphql/helpers';
import { Chain } from '@src/web3/core/interfaces';

const query = (id: string) => gql`
    {
        swap(id: "${id}") {
            offers (orderBy: eth, orderDirection: desc) ${offerBare}
        }
    }
`;

const pollOffersQuery = async (chainId: Chain, swapId: string) => {
    return (await executeQuery(chainId, query(swapId), 'swap')).offers as Promise<
        NL.GraphQL.Fragments.Offer.Bare[]
    >;
};

export default pollOffersQuery;
