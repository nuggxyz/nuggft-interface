import gql from 'graphql-tag';

import { offerThumbnail } from '../../../graphql/fragments/offer';
import { executeQuery } from '../../../graphql/helpers';
import { isUndefinedOrNullOrArrayEmpty, isUndefinedOrNullOrObjectEmpty } from '../../../lib';
import { SupportedChainId } from '../../web32/config';

const query = (id: string, epoch: string) => gql`
    {
        user(id: "${id}") {
            offers (where: { claimed: false}) ${offerThumbnail}
        }
    }
`;

const unclaimedOffersQuery = async (chainId: SupportedChainId, id: string, epoch?: string) => {
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
