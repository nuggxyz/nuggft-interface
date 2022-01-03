import { gql, useSubscription } from '@apollo/client';

import useRecursiveTimeout from '../../hooks/useRecursiveTimeout';
import { isUndefinedOrNullOrStringEmpty } from '../../lib';
import constants from '../../lib/constants';
import { client } from '../../graphql/client';

import SwapState from '.';

export default () => {
    const swapId = SwapState.select.id();

    const { data } = useSubscription(
        gql`
            subscription Cool($swapId: ID!) {
                swap(id: $swapId) {
                    offers(orderBy: eth, orderDirection: desc) {
                        id
                        user {
                            id
                        }
                        eth
                        ethUsd
                        claimed
                        owner
                    }
                }
            }
        `,
        { client, variables: { swapId } },
    );

    console.log(data);
    // useRecursiveTimeout(() => {
    //     if (!isUndefinedOrNullOrStringEmpty(swapId)) {
    //         SwapState.dispatch.pollOffers({ swapId });
    //     }
    // }, constants.QUERYTIME);

    return null;
};
