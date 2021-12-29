import gql from 'graphql-tag';

import { idFragment } from '../../../graphql/fragments/general';
import { loanBare } from '../../../graphql/fragments/loan';
import { executeQuery } from '../../../graphql/helpers';
import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../../lib';

const query = (
    address: string,
    orderDirection: 'asc' | 'desc',
    searchValue: string,
    first: number,
    skip: number,
) => gql`
    {
        user(id: "${address}") {
            loans (
                where: {${
                    !isUndefinedOrNullOrStringEmpty(searchValue)
                        ? `id: "${searchValue}"`
                        : ''
                } liquidated: false},
                first: ${first},
                skip: ${skip}
            ) ${loanBare}
        }
    }
`;

const loanedNuggsQuery = async (
    address: string,
    orderDirection: 'asc' | 'desc',
    searchValue: string,
    first: number,
    skip: number,
) => {
    try {
        const result = (await executeQuery(
            query(address, orderDirection, searchValue, first, skip),
            'user',
        )) as NL.GraphQL.Fragments.User.Bare;

        return !isUndefinedOrNullOrObjectEmpty(result) &&
            !isUndefinedOrNullOrArrayEmpty(result.loans)
            ? result.loans
            : [];
    } catch (e) {
        throw new Error(`loanedNuggsQuery: ${e}`);
    }
};

export default loanedNuggsQuery;
