import gql from 'graphql-tag';
import { BigNumber, ethers } from 'ethers';

import { offerThumbnail } from '@src/graphql/fragments/offer';
import { executeQuery } from '@src/graphql/helpers';
import { isUndefinedOrNullOrArrayEmpty, isUndefinedOrNullOrObjectEmpty } from '@src/lib';
import { Chain } from '@src/web3/core/interfaces';
import { itemOfferBare } from '@src/graphql/fragments/itemOffer';

const query = (id: string, epoch: string) => gql`
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

const unclaimedOffersQuery = async (chainId: Chain, address: string, epoch?: string) => {
    const result = (await executeQuery(
        chainId,
        query(address.toLowerCase(), epoch),
        'user',
    )) as NL.GraphQL.Fragments.User.Bare;

    return !isUndefinedOrNullOrObjectEmpty(result) && !isUndefinedOrNullOrArrayEmpty(result.offers)
        ? [
              ...(result.offers.filter(
                  (offer) =>
                      //@ts-ignore
                      offer.swap.endingEpoch !== null &&
                      //@ts-ignore
                      offer.swap.endingEpoch < +epoch,
              ) as NL.GraphQL.Fragments.Offer.Thumbnail[]),
              ...result.nuggs.flatMap((nugg) =>
                  nugg.offers.map((offer) => {
                      // 2-1041-0-51
                      let idArr = offer.id.split('-');
                      let id = BigNumber.from(idArr[1]).shl(24).or(idArr[0]);
                      return {
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
                          id: `${idArr[1]}-${idArr[2]}`,
                          _addr: ethers.utils.hexZeroPad(BigNumber.from(idArr[3])._hex, 20),
                      };
                  }),
              ),
          ]
        : [];
};

export default unclaimedOffersQuery;
// 0x02df8e38aace7480a337517406273ea0f08c896e
