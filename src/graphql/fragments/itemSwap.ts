import gql from 'graphql-tag';
import { epochFull } from './epoch';
import { idFragment } from './general';
import { nuggUser } from './nugg';
// import { itemOfferFull } from './itemOffer';
// import { nuggFull } from './nugg';
// import { nuggItemFull } from './nuggItem';

// export const itemSwapFull = gql`
//     {
//         id
//         sellingNuggItem ${nuggItemFull}
//         offers ${itemOfferFull}
//         epoch ${epochFull}
//         eth
//         ethUsd
//         owner ${nuggFull}
//         leader ${nuggFull}
//     }
// `;

export const itemSwapThumbnail = gql`
    {
        id
        endingEpoch
        num
        eth
        ethUsd
        owner ${idFragment}
        leader ${idFragment}
        sellingNuggItem {
            nugg ${nuggUser}
        }
    }
`;
