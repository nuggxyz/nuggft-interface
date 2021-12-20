import gql from 'graphql-tag';

import { offerThumbnail } from '../../../graphql/fragments/offer';
import { executeQuery } from '../../../graphql/helpers';
import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
} from '../../../lib';

const query = (id: string, first: number, skip: number) => gql`
    {
        user(id: "${id}") {
            offers (
                where: { claimed: true },
                orderDirection: desc,
                orderBy: id,
                first: ${first}
                skip: ${skip}
            ) ${offerThumbnail}
        }
    }
`;

const historyQuery = async (id: string, first: number, skip: number) => {
    const result = (await executeQuery(
        query(id, first, skip),
        'user',
    )) as NL.GraphQL.Fragments.User.Bare;

    return !isUndefinedOrNullOrObjectEmpty(result) &&
        !isUndefinedOrNullOrArrayEmpty(result.offers)
        ? (result.offers as NL.GraphQL.Fragments.Offer.Thumbnail[])
        : [];
};

export default historyQuery;
