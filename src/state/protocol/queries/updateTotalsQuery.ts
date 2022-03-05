import gql from 'graphql-tag';

import config from '@src/config';
import { protocolTotals } from '@src/graphql/fragments/protocol';
import { executeQuery } from '@src/graphql/helpers';
import { Chain } from '@src/web3/core/interfaces';

const query = () => gql`
{
    protocol(id: "${config.NUGG_PROTOCOL}") ${protocolTotals}
}`;

const updateTotalsQuery = async (chainId: Chain) => {
    return (await executeQuery(
        chainId,
        query(),
        'protocol',
    )) as Promise<NL.GraphQL.Fragments.Protocol.Totals>;
};

export default updateTotalsQuery;
