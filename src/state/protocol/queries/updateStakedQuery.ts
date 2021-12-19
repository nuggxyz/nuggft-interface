import gql from 'graphql-tag';

import config from '../../../config';
import { protocolStaked } from '../../../graphql/fragments/protocol';
import { executeQuery } from '../../../graphql/helpers';

const query = () => gql`
{
    protocol(id: "${config.NUGG_PROTOCOL}") ${protocolStaked}
}`;

const updateUsersQuery = async () => {
    return (await executeQuery(
        query(),
        'protocol',
    )) as Promise<NL.GraphQL.Fragments.Protocol.Staked>;
};

export default updateUsersQuery;
