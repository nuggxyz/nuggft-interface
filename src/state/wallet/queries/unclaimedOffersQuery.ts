import gql from 'graphql-tag';

import { offerThumbnail } from '@src/graphql/fragments/offer';
import { executeQuery } from '@src/graphql/helpers';
import { isUndefinedOrNullOrArrayEmpty, isUndefinedOrNullOrObjectEmpty } from '@src/lib';
import { Chain } from '@src/web3/core/interfaces';

const query = (id: string, epoch: string) => gql`
    {
        user(id: "${id}") {
            offers (where: { claimed: false}) ${offerThumbnail}
        }
    }
`;

const unclaimedOffersQuery = async (chainId: Chain, id: string, epoch?: string) => {
    const result = (await executeQuery(
        chainId,
        query(id.toLowerCase(), epoch),
        'user',
    )) as NL.GraphQL.Fragments.User.Bare;

    return !isUndefinedOrNullOrObjectEmpty(result) && !isUndefinedOrNullOrArrayEmpty(result.offers)
        ? (result.offers.filter(
              (offer) =>
                  //@ts-ignore
                  offer.swap.endingEpoch !== null &&
                  //@ts-ignore
                  offer.swap.endingEpoch < +epoch,
          ) as NL.GraphQL.Fragments.Offer.Thumbnail[])
        : [];
};

export default unclaimedOffersQuery;
// 0x02df8e38aace7480a337517406273ea0f08c896e
