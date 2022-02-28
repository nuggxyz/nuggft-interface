import gql from 'graphql-tag';
import { ApolloClient } from '@apollo/client';

import config from '@src/config';
import { executeQuery2 } from '@src/graphql/helpers';

const query = () => gql`
{
    protocol(id: "${config.NUGG_PROTOCOL}") {id}
}`;

const updateProtocolQuery = async (client: ApolloClient<any>) => {
    return (await executeQuery2(
        client,
        query(),
        'protocol',
    )) as Promise<NL.GraphQL.Fragments.Protocol.Full>;
};

export default updateProtocolQuery;
