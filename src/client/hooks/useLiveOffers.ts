import React from 'react';
import gql from 'graphql-tag';

import client from '@src/client/index';
import { EthInt } from '@src/classes/Fraction';
import { extractItemId } from '@src/lib/index';
import { TokenId } from '@src/client/router';

const useLiveOffers = (tokenId: TokenId | undefined) => {
    const graph = client.live.graph();

    React.useEffect(() => {
        if (tokenId && graph) {
            const isItem = tokenId.startsWith('item-');
            const instance = graph
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
                                : x.data.offers!.map((z) => {
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
    }, [tokenId, graph]);

    return null;
};

export default useLiveOffers;
