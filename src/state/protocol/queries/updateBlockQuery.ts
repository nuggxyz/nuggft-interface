import gql from 'graphql-tag';

import { _metaBare } from '../../../graphql/fragments/_meta';
import { executeQuery } from '../../../graphql/helpers';

const query = () => gql`
{
    _meta ${_metaBare}
}`;

const updateBlockQuery = async () => {
    return (await executeQuery(
        query(),
        '_meta',
    )) as Promise<NL.GraphQL.Fragments._Meta.Bare>;
};

export default updateBlockQuery;
