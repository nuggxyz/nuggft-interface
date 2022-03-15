import React from 'react';
import gql from 'graphql-tag';

import client from '@src/client/index';
import { EthInt } from '@src/classes/Fraction';
import { extractItemId } from '@src/lib/index';
import { TokenId } from '@src/client/router';

const useLiveOffers = (tokenId: TokenId | undefined) => {
    const apollo = client.live.apollo();

    React.useEffect(() => {
        if (tokenId && apollo) {
            const isItem = tokenId.startsWith('item-');
            const instance = apollo
                .subscribe<{
                    nugg: {
                        offers?: {
                            user: { id: string };
                            eth: string;
                            txhash: string;
                        }[];
                    };

                    itemOffers?: {
                        nugg: { id: string };
                        eth: string;
                        txhash: string;
                    }[];
                }>({
                    query: isItem
                        ? gql`
                              subscription useLiveItemOffers($tokenId: ID!) {
                                  itemOffers(
                                      where: { swap_starts_with: $tokenId }
                                      orderBy: eth
                                      orderDirection: desc
                                  ) {
                                      nugg {
                                          id
                                      }
                                      eth
                                      txhash
                                  }
                              }
                          `
                        : gql`
                              subscription useLiveOffers($tokenId: ID!) {
                                  nugg(id: $tokenId) {
                                      offers(orderBy: eth, orderDirection: desc) {
                                          user {
                                              id
                                          }
                                          eth
                                          txhash
                                      }
                                  }
                              }
                          `,
                    variables: { tokenId: extractItemId(tokenId) },
                })
                .subscribe((x) => {
                    if (x.data) {
                        client.actions.updateOffers(
                            tokenId,
                            isItem
                                ? x.data.itemOffers!.map((z) => {
                                      return {
                                          eth: new EthInt(z.eth),
                                          user: z.nugg.id,
                                          txhash: z.txhash,
                                      };
                                  })
                                : x.data.nugg.offers!.map((z) => {
                                      return {
                                          eth: new EthInt(z.eth),
                                          user: z.user.id,
                                          txhash: z.txhash,
                                      };
                                  }),
                        );
                    }
                });
            return () => {
                instance.unsubscribe();
            };
        }
        return () => undefined;
    }, [tokenId, apollo]);

    return null;
};

export default useLiveOffers;
