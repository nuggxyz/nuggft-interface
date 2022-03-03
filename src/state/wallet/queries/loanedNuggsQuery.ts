import gql from 'graphql-tag';

import { loanBare } from '@src/graphql/fragments/loan';
import { executeQuery } from '@src/graphql/helpers';
import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '@src/lib';
import { Chain } from '@src/web3/core/interfaces';

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
                    !isUndefinedOrNullOrStringEmpty(searchValue) ? `id: "${searchValue}"` : ''
                } liquidated: false},
                first: ${first},
                skip: ${skip}
            ) ${loanBare}
        }
    }
`;

const loanedNuggsQuery = async (
    chainId: Chain,

    address: string,
    orderDirection: 'asc' | 'desc',
    searchValue: string,
    first: number,
    skip: number,
) => {
    try {
        const result = (await executeQuery(
            chainId,
            query(address.toLowerCase(), orderDirection, searchValue, first, skip),
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
