import gql from 'graphql-tag';

import config from '../../../config';
import { protocolTotals } from '../../../graphql/fragments/protocol';
import { executeQuery } from '../../../graphql/helpers';

const query = () => gql`
{
    protocol(id: "${config.NUGG_PROTOCOL}") ${protocolTotals}
}`;

const updateTotalsQuery = async () => {
    return (await executeQuery(
        query(),
        'protocol',
    )) as Promise<NL.GraphQL.Fragments.Protocol.Totals>;
};

export default updateTotalsQuery;
