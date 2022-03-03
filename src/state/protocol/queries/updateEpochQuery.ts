import gql from 'graphql-tag';

import config from '@src/config';
import { protocolEpochs } from '@src/graphql/fragments/protocol';
import { executeQuery } from '@src/graphql/helpers';
import { Chain } from '@src/web3/core/interfaces';

const query = () => gql`
{
    protocol(id: "${config.NUGG_PROTOCOL}") ${protocolEpochs}
}`;

const updateEpochQuery = async (chainId: Chain) => {
    return (await executeQuery(
        chainId,
        query(),
        'protocol',
    )) as Promise<NL.GraphQL.Fragments.Protocol.Epochs>;
};

export default updateEpochQuery;
