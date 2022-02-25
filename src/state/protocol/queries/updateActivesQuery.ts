import gql from 'graphql-tag';

import config from '../../../config';
import { protocolActives } from '../../../graphql/fragments/protocol';
import { executeQuery } from '../../../graphql/helpers';
import { SupportedChainId } from '../../web32/config';

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
