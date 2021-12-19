import gql from 'graphql-tag';

import { offerBare } from '../../../graphql/fragments/offer';
import { executeQuery } from '../../../graphql/helpers';

const query = (id: string) => gql`
    {
        offers (where: {swap: "${id}"}, orderBy: eth, orderDirection: desc) ${offerBare}
    }
`;

const pollOffersQuery = async (swapId: string) => {
    return (await executeQuery(query(swapId), 'offers')) as Promise<
        NL.GraphQL.Fragments.Offer.Bare[]
    >;
};

export default pollOffersQuery;
