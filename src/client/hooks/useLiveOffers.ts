import React, { useCallback, useMemo } from 'react';
import gql from 'graphql-tag';

import client from '@src/client/index';
import { EthInt } from '@src/classes/Fraction';
import { extractItemId, isUndefinedOrNullOrBooleanFalse } from '@src/lib/index';
import { TokenId } from '@src/client/router';
import { executeQuery3 } from '@src/graphql/helpers';

type LiveOfferType = {
    nugg: {
        activeSwap: {
            offers: {
                user: { id: string };
                eth: string;
                txhash: string;
            }[];
        };
    };

    item: {
        activeSwap: {
            offers: {
                nugg: { id: string };
                eth: string;
                txhash: string;
            }[];
        };
    };
};

const useLiveOffers = (tokenId: TokenId | undefined) => {
    const apollo = client.live.apollo();
    const isItem = useMemo(
        () => !isUndefinedOrNullOrBooleanFalse(tokenId && tokenId.startsWith('item-')),
        [tokenId],
    );
    const parseDataAndUpdate = useCallback(
        (data: LiveOfferType) =>
            tokenId &&
            data &&
            client.actions.updateOffers(
                tokenId,
                isItem
                    ? data.item.activeSwap
                        ? data.item.activeSwap.offers.map((z) => {
                              return {
                                  eth: new EthInt(z.eth),
                                  user: z.nugg.id,
                                  txhash: z.txhash,
                              };
                          })
                        : []
                    : data.nugg.activeSwap
                    ? data.nugg.activeSwap.offers.map((z) => {
                          return {
                              eth: new EthInt(z.eth),
                              user: z.user.id,
                              txhash: z.txhash,
                          };
                      })
                    : [],
            ),
        [isItem, tokenId],
    );

    React.useEffect(() => {
        if (tokenId && apollo) {
            void executeQuery3<LiveOfferType>(
                isItem
                    ? gql`
                          query getItemOffers($tokenId: ID!) {
                              item(id: $tokenId) {
                                  activeSwap {
                                      offers(orderBy: eth, orderDirection: desc) {
                                          nugg {
                                              id
                                          }
                                          eth
                                          txhash
                                      }
                                  }
                              }
                          }
                      `
                    : gql`
                          query getLiveOffers($tokenId: ID!) {
                              nugg(id: $tokenId) {
                                  activeSwap {
                                      offers(orderBy: eth, orderDirection: desc) {
                                          user {
                                              id
                                          }
                                          eth
                                          txhash
                                      }
                                  }
                              }
                          }
                      `,
                { tokenId: extractItemId(tokenId) },
            ).then((data) => {
                parseDataAndUpdate(data);
            });
            const instance = apollo
                .subscribe<LiveOfferType>({
                    query: isItem
                        ? gql`
                              subscription useLiveItemOffers($tokenId: ID!) {
                                  item(id: $tokenId) {
                                      activeSwap {
                                          offers(orderBy: eth, orderDirection: desc) {
                                              nugg {
                                                  id
                                              }
                                              eth
                                              txhash
                                          }
                                      }
                                  }
                              }
                          `
                        : gql`
                              subscription useLiveOffers($tokenId: ID!) {
                                  nugg(id: $tokenId) {
                                      activeSwap {
                                          offers(orderBy: eth, orderDirection: desc) {
                                              user {
                                                  id
                                              }
                                              eth
                                              txhash
                                          }
                                      }
                                  }
                              }
                          `,
                    variables: { tokenId: extractItemId(tokenId) },
                })
                .subscribe((x) => x.data && parseDataAndUpdate(x.data));

            return () => {
                instance.unsubscribe();
            };
        }
        return () => undefined;
    }, [tokenId, apollo, isItem, parseDataAndUpdate]);

    return null;
};

export default useLiveOffers;
