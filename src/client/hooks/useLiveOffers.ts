import React from 'react';
import { gql } from '@apollo/client';

import client from '@src/client/index';
import { EthInt } from '@src/classes/Fraction';
import { extractItemId } from '@src/lib/index';

export const useLiveOffers = (tokenId: string) => {
    const apollo = client.live.apollo();

    React.useEffect(() => {
        if (tokenId) {
            const isItem = tokenId.startsWith('item-');
            const instance = apollo
                .subscribe<{
                    offers?: {
                        user: { id: string };
                        eth: string;
                        txhash: string;
                    }[];

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
                                  offers(
                                      where: { swap_starts_with: $tokenId }
                                      orderBy: eth
                                      orderDirection: desc
                                  ) {
                                      user {
                                          id
                                      }
                                      eth
                                      txhash
                                  }
                              }
                          `,
                    variables: { tokenId: extractItemId(tokenId) },
                })
                .subscribe((x) => {
                    client.actions.updateOffers(
                        tokenId,
                        isItem
                            ? x.data.itemOffers!.map((x) => {
                                  return {
                                      eth: new EthInt(x.eth),
                                      user: x.nugg.id,
                                      txhash: x.txhash,
                                  };
                              })
                            : x.data.offers!.map((x) => {
                                  return {
                                      eth: new EthInt(x.eth),
                                      user: x.user.id,
                                      txhash: x.txhash,
                                  };
                              }),
                    );
                });
            return () => {
                instance.unsubscribe();
            };
        }
    }, [tokenId, apollo]);

    return;
};
