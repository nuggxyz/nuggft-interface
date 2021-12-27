import gql from 'graphql-tag';

import { offerThumbnail } from '../../../graphql/fragments/offer';
import { executeQuery } from '../../../graphql/helpers';
import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
} from '../../../lib';

const query = (id: string, epoch: string) => gql`
    {
        user(id: "${id}") {
            offers (where: { claimed: false, swap_not_contains: "${epoch}", swap_not: "0-0", swap_not_ends_with: "-0" }) ${offerThumbnail}
        }
    }
`;

const unclaimedOffersQuery = async (id: string, epoch?: string) => {
    const result = (await executeQuery(
        query(id, epoch),
        'user',
    )) as NL.GraphQL.Fragments.User.Bare;

    return !isUndefinedOrNullOrObjectEmpty(result) &&
        !isUndefinedOrNullOrArrayEmpty(result.offers)
        ? (result.offers as NL.GraphQL.Fragments.Offer.Thumbnail[])
        : [];
};

export default unclaimedOffersQuery;
// 0x02df8e38aace7480a337517406273ea0f08c896e
