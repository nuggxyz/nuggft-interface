import gql from 'graphql-tag';

import { _metaBare } from '@src/graphql/fragments/_meta';
import { executeQuery } from '@src/graphql/helpers';
import { SupportedChainId } from '@src/state/web32/config';

const query = () => gql`
{
    _meta ${_metaBare}
}`;

const updateBlockQuery = async (chainId: SupportedChainId) => {
    return (await executeQuery(
        chainId,
        query(),
        '_meta',
    )) as Promise<NL.GraphQL.Fragments._Meta.Bare>;
};

export default updateBlockQuery;
