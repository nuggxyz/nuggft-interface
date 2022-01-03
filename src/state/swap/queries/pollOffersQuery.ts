import gql from 'graphql-tag';

import { offerBare } from '../../../graphql/fragments/offer';
import { executeQuery } from '../../../graphql/helpers';

const query = (id: string) => gql`
    {
        swap(id: "${id}") {
            offers (orderBy: eth, orderDirection: desc) ${offerBare}
        }
    }
`;

const pollOffersQuery = async (swapId: string) => {
    return (await executeQuery(query(swapId), 'swap')).offers as Promise<
        NL.GraphQL.Fragments.Offer.Bare[]
    >;
};

export default pollOffersQuery;
