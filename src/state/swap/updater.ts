import { gql, useSubscription } from '@apollo/client';
import { useEffect } from 'react';

import useRecursiveTimeout from '../../hooks/useRecursiveTimeout';
import { isUndefinedOrNullOrStringEmpty } from '../../lib';
import constants from '../../lib/constants';
import { client } from '../../graphql/client';

import SwapState from '.';

export default () => {
    const swapId = SwapState.select.id();

    // const { data } = useSubscription(
    //     gql`
    //         subscription Cool($swapId: ID!) {
    //             swap(id: $swapId) {
    //                 id
    //                 offers(orderBy: eth, orderDirection: desc) {
    //                     id
    //                     user {
    //                         id
    //                     }
    //                     eth
    //                     ethUsd
    //                     claimed
    //                     owner
    //                 }
    //             }
    //         }
    //     `,
    //     { client, variables: { swapId } },
    // );

    // useEffect(() => {
    //     if (data && data.swap && data.swap.offers) {
    //         console.log("GO ON GIT")
    //         SwapState.dispatch.setOffers({
    //             offers: data.swap.offers,
    //             swapId: swapId,
    //         });
    //     }
    // }, [data]);
    useRecursiveTimeout(() => {
        if (!isUndefinedOrNullOrStringEmpty(swapId)) {
            SwapState.dispatch.pollOffers({ swapId });
        }
    }, constants.QUERYTIME);

    return null;
};
