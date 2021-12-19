import gql from 'graphql-tag';

import config from '../../../config';
import { protocolActives } from '../../../graphql/fragments/protocol';
import { executeQuery } from '../../../graphql/helpers';

const query = () => gql`
{
    protocol(id: "${config.NUGG_PROTOCOL}") ${protocolActives}
}`;

const updateActivesQuery = async () => {
    return (await executeQuery(
        query(),
        'protocol',
    )) as Promise<NL.GraphQL.Fragments.Protocol.Actives>;
};

export default updateActivesQuery;
