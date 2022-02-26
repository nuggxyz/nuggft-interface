import gql from 'graphql-tag';

import config from '@src/config';
import { protocolStaked } from '@src/graphql/fragments/protocol';
import { executeQuery } from '@src/graphql/helpers';
import { SupportedChainId } from '@src/web3/config';

const query = () => gql`
{
    protocol(id: "${config.NUGG_PROTOCOL}") ${protocolStaked}
}`;

const updateUsersQuery = async (chainId: SupportedChainId) => {
    return (await executeQuery(
        chainId,
        query(),
        'protocol',
    )) as Promise<NL.GraphQL.Fragments.Protocol.Staked>;
};

export default updateUsersQuery;
