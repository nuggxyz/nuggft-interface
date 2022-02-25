import gql from 'graphql-tag';

import { loanBare } from '../../../graphql/fragments/loan';
import { executeQuery } from '../../../graphql/helpers';
import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../../lib';
import { SupportedChainId } from '../../web32/config';

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
    chainId: SupportedChainId,

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
