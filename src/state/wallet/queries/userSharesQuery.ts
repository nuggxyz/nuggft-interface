import gql from 'graphql-tag';

import { idFragment } from '@src/graphql/fragments/general';
import { executeQuery } from '@src/graphql/helpers';
import { isUndefinedOrNullOrArrayEmpty, isUndefinedOrNullOrObjectEmpty } from '@src/lib';
import { Chain } from '@src/web3/core/interfaces';

const query = (id: string) => gql`
    {
        user(id: "${id}") {
            nuggs (first: 1000)${idFragment}
        }
    }
`;

const userSharesQuery = async (chainId: Chain, id: string) => {
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
