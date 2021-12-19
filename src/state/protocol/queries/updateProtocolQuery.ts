import gql from 'graphql-tag';

import config from '../../../config';
import { executeQuery } from '../../../graphql/helpers';

const query = () => gql`
{
    protocol(id: "${config.NUGG_PROTOCOL}") {id}
}`;

const updateProtocolQuery = async () => {
    return (await executeQuery(
        query(),
        'protocol',
    )) as Promise<NL.GraphQL.Fragments.Protocol.Full>;
};

export default updateProtocolQuery;
