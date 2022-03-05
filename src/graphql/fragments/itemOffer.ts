import gql from 'graphql-tag';
import { idFragment } from './general';
// import { itemSwapFull } from './itemSwap';
// import { nuggFull } from './nugg';

// export const itemOfferFull = gql`
//     {
//         id
//         swap ${itemSwapFull}
//         nugg ${nuggFull}
//         eth
//         ethUsd
//         claimed
//         owner
//     }
// `;

export const itemOfferBare = gql`
{
    id
    swap {
        id
        endingEpoch
        num
        eth
        ethUsd
        owner ${idFragment}
        leader ${idFragment}
    }
    nugg ${idFragment}
    eth
    ethUsd
    claimed
    owner
}`;
