import gql from 'graphql-tag';

import { idFragment } from '../../../graphql/fragments/general';
import { executeQuery } from '../../../graphql/helpers';
import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
} from '../../../lib';

const query = (id: string) => gql`
    {
        user(id: "${id}") {
            nuggs ${idFragment}
        }
    }
`;

const userSharesQuery = async (id: string) => {
    const result = (await executeQuery(
        query(id),
        'user',
    )) as NL.GraphQL.Fragments.User.Bare;
    return !isUndefinedOrNullOrObjectEmpty(result) &&
        !isUndefinedOrNullOrArrayEmpty(result.nuggs)
        ? result.nuggs.length
        : 0;
};

export default userSharesQuery;
