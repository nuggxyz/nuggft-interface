import gql from 'graphql-tag';
import { ApolloClient } from '@apollo/client';

import config from '@src/config';
import { protocolActives } from '@src/graphql/fragments/protocol';
import { executeQuery2 } from '@src/graphql/helpers';

const query = () => gql`
{
    protocol(id: "${config.NUGG_PROTOCOL}") ${protocolActives}
}`;

const updateActivesQuery = async (client: ApolloClient<any>) => {
    return (await executeQuery2(
        client,
        query(),
        'protocol',
    )) as Promise<NL.GraphQL.Fragments.Protocol.Actives>;
};

export default updateActivesQuery;
