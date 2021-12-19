import gql from 'graphql-tag';

import config from '../../../config';
import { protocolPrices } from '../../../graphql/fragments/protocol';
import { executeQuery } from '../../../graphql/helpers';

const query = () => gql`
{
    protocol(id: "${config.NUGG_PROTOCOL}") ${protocolPrices}
}`;

const updatePricesQuery = async () => {
    return (await executeQuery(
        query(),
        'protocol',
    )) as Promise<NL.GraphQL.Fragments.Protocol.Prices>;
};

export default updatePricesQuery;
