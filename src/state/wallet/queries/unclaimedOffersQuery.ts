import gql from 'graphql-tag';

import { offerThumbnail } from '@src/graphql/fragments/offer';
import { executeQuery } from '@src/graphql/helpers';
import {
    formatItemSwapIdForSend,
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
    padToAddress,
} from '@src/lib';
import { Chain } from '@src/web3/core/interfaces';
import { itemOfferBare } from '@src/graphql/fragments/itemOffer';
import constants from '@src/lib/constants';

const query = (id: string) => gql`
    {
        user(id: "${id}") {
            offers (where: { claimed: false}) ${offerThumbnail}
            nuggs {
                id
                offers (where: { claimed: false}) ${itemOfferBare}
            }
        }
    }
`;

const unclaimedOffersQuery = async (chainId: Chain, address: string, epoch?: string | number) => {
    const result = (await executeQuery(
        chainId,
        query(address.toLowerCase()),
        'user',
    )) as NL.GraphQL.Fragments.User.Bare;
    return !isUndefinedOrNullOrObjectEmpty(result) && !isUndefinedOrNullOrArrayEmpty(result.offers)
        ? [
              ...(result.offers.filter(
                  (offer) => offer.swap.endingEpoch !== null && offer.swap.endingEpoch < +epoch,
              ) as (NL.GraphQL.Fragments.Offer.Thumbnail & { nugg: { id: string } })[]),
              ...result.nuggs.flatMap((nugg) =>
                  nugg.offers.reduce((acc, offer) => {
                      if (offer.swap.endingEpoch !== null) {
                          let idArr = offer.id.split('-');
                          let id = formatItemSwapIdForSend(idArr);
                          acc.push({
                              ...offer,
                              swap: {
                                  ...offer.swap,
                                  nugg: {
                                      dotnuggRawCache: offer.swap.sellingItem.dotnuggRawCache,
                                      id,
                                  },
                                  leader: {
                                      id:
                                          nugg.id === offer.swap.leader.id
                                              ? address
                                              : offer.swap.leader.id,
                                      itemNuggId: offer.swap.leader.id,
                                  },
                              },
                              id: `${idArr[constants.ITEM_ID_POS]}-${
                                  idArr[constants.ITEM_NUGG_POS]
                              }`,
                              _addr: padToAddress(idArr[3]),
                          });
                      }
                      return acc;
                  }, []),
              ),
          ]
        : [];
};

export default unclaimedOffersQuery;
// 0x02df8e38aace7480a337517406273ea0f08c896e
