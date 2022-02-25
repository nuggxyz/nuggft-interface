import gql from 'graphql-tag';

import { idFragment } from '../../../graphql/fragments/general';
import { executeQuery } from '../../../graphql/helpers';
import { isUndefinedOrNullOrArrayEmpty, isUndefinedOrNullOrObjectEmpty } from '../../../lib';
import { SupportedChainId } from '../../web32/config';

const query = (id: string) => gql`
    {
        user(id: "${id}") {
            nuggs (first: 1000)${idFragment}
        }
    }
`;

const userSharesQuery = async (chainId: SupportedChainId, id: string) => {
    const result = (await executeQuery(
        chainId,
        query(id.toLowerCase()),
        'user',
    )) as NL.GraphQL.Fragments.User.Bare;
    return !isUndefinedOrNullOrObjectEmpty(result) && !isUndefinedOrNullOrArrayEmpty(result.nuggs)
        ? result.nuggs.length
        : 0;
};

export default userSharesQuery;
