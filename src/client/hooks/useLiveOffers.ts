import React, { useCallback } from 'react';
import { gql } from '@apollo/client';

import { useOffer } from '@src/state/socket/hooks';
import client from '@src/client/index';

const query = gql`
    subscription useLiveOffers($tokenId: ID!) {
        offers(where: { swap_starts_with: $tokenId }, orderBy: eth, orderDirection: desc) {
            user {
                id
            }
            eth
            swap {
                id
                epoch {
                    id
                }
                nugg {
                    id
                }
            }
        }
    }
`;

export const useLiveOffers = (tokenId: string) => {
    const apollo = client.useApollo();

    const [offers, setOffers] = React.useState<{ user: string; eth: string }[]>([]);

    React.useEffect(() => {
        const instance = apollo
            .subscribe<{
                offers: {
                    user: { id: string };
                    eth: string;
                    swap: { epoch: { id: string }; nugg: { id: string } };
                }[];
            }>({ query: query, variables: { tokenId } })
            .subscribe((x) => {
                setOffers(
                    x.data.offers.map((x) => {
                        return { user: x.user.id, eth: x.eth };
                    }),
                );
            });
        return () => {
            instance.unsubscribe();
        };
    }, [tokenId, apollo]);

    return offers;
};

export const useSafeLiveOffers = (tokenId: string) => {
    const apolloOffers = useLiveOffers(tokenId);

    const [offers, setOffers] = React.useState<{ user: string; eth: string }[]>([]);
    const [leader, setLeader] = React.useState<{ user: string; eth: string }>();

    // LOOK #41 @danny7even comment this out if you want to see the effect of the graph subscription
    ////////////////////////////////
    useOffer((x) => {
        if (+x.tokenId === +tokenId) {
            const input = { user: x.account, eth: x.value };
            merge(input);
        }
    });
    ////////////////////////////////

    const merge = useCallback(
        (input: { user: string; eth: string }) => {
            const update = mergeUnique(input ? [input] : [], offers).sort((a, b) =>
                a < b ? -1 : 1,
            );

            setOffers(update);
            if (update.length > 0) setLeader(update[0]);
        },
        [offers],
    );

    React.useEffect(() => {
        console.log({ offers, apolloOffers });
        const update = mergeUnique(offers, apolloOffers).sort((a, b) => (a < b ? -1 : 1));
        // if (offers.length === 0 && apolloOffers.length !== 0) {
        setOffers(update);
        if (update.length > 0) {
            setLeader(update[0]);
        }
        // }
    }, [apolloOffers]);

    return { offers, leader };
};

export function duplicates(arr1: BigInt[]): BigInt[] {
    return arr1.filter((item, index) => arr1.indexOf(item) !== index);
}

const mergeUnique = (
    array1: { user: string; eth: string }[],
    array2: { user: string; eth: string }[],
) => {
    let arr = array1.concat(array2);
    let len = arr.length;

    let tmp: number;
    let array3: { user: string; eth: string }[] = [];
    let array5: string[] = [];

    while (len--) {
        let itm = arr[len];
        if ((tmp = array5.indexOf(itm.user)) === -1) {
            array3.unshift(itm);
            array5.unshift(itm.user);
        } else {
            if (+array3[tmp].eth < +itm.eth) {
                array3[tmp] = itm;
                array5[tmp] = itm.user;
            }
        }
    }

    return array3;
};
