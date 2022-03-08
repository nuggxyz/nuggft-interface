import { gql } from '@apollo/client';
import React, { useEffect } from 'react';

import client from '..';

export const useLiveMyNuggs = (userId: string) => {
    const [myNuggs, setMyNuggs] = React.useState<NL.GraphQL.Fragments.Nugg.ListItem[]>([]);

    const apollo = client.live.apollo();

    useEffect(() => {
        if (userId) {
            const instance = apollo
                .subscribe<{
                    user: {
                        nuggs: NL.GraphQL.Fragments.Nugg.ListItem[];
                    };
                }>({
                    query: gql`
                        subscription useLiveMyNuggs($userId: ID!) {
                            user(id: $userId) {
                                nuggs {
                                    id
                                    dotnuggRawCache
                                    activeLoan {
                                        id
                                    }
                                    activeSwap {
                                        id
                                    }
                                }
                            }
                        }
                    `,
                    variables: { userId },
                })
                .subscribe((x) => {
                    console.log({ x });
                    if (x.data.user.nuggs) {
                        setMyNuggs(x.data.user.nuggs);
                    }
                });
            return () => {
                instance.unsubscribe();
            };
        }
    }, [apollo, userId]);

    return myNuggs;
};
