import gql from 'graphql-tag';

import config from '../../../config';
import { protocolFull } from '../../../graphql/fragments/protocol';
import { executeQuery } from '../../../graphql/helpers';

const query = () => gql`
{
    protocol(id: "${config.NUGG_PROTOCOL}") ${protocolFull}
}`;

const updateProtocolQuery = async () => {
    return (await executeQuery(
        query(),
        'protocol',
    )) as Promise<NL.GraphQL.Fragments.Protocol.Full>;
};

export default updateProtocolQuery;
