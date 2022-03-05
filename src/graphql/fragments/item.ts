import gql from 'graphql-tag';
import { idFragment } from './general';

export const itemFull = gql`
    {
        id
        count
    }
`;

export const itemThumbnail = gql`
    {
        id
        swaps (orderBy: id, orderDirection: desc) {
            id
            eth
            ethUsd
            owner ${idFragment}
            leader ${idFragment}
            num
            endingEpoch
        }
        activeSwap ${idFragment}
    }
`;
