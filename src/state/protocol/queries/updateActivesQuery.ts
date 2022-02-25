import gql from 'graphql-tag';

import config from '@src/config';
import { protocolActives } from '@src/graphql/fragments/protocol';
import { executeQuery } from '@src/graphql/helpers';
import { SupportedChainId } from '@src/state/web32/config';

const query = () => gql`
{
    protocol(id: "${config.NUGG_PROTOCOL}") ${protocolActives}
}`;

const updateActivesQuery = async (chainId: SupportedChainId) => {
    return (await executeQuery(
        chainId,
        query(),
        'protocol',
    )) as Promise<NL.GraphQL.Fragments.Protocol.Actives>;
};

export default updateActivesQuery;
