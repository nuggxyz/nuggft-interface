import gql from 'graphql-tag';
import { epochFull } from './epoch';
import { idFragment } from './general';
import { itemOfferBare } from './itemOffer';
// import { nuggBare, nuggFull } from './nugg';
// import { offerBare, offerFull } from './offer';
// import { userFull } from './user';

// export const swapFull = gql`
//     {
//         id
//         nugg ${nuggFull}
//         offers ${offerFull}
//         epoch ${epochFull}
//         eth
//         ethUsd
//         owner ${userFull}
//         leader ${userFull}
//     }
// `;

// TODO DANNY figure out why this is a thing
export const swapBare = gql`
    {
        id
        nugg {
            id
            user ${idFragment}
            items ${idFragment}
            offers {
                id
                swap ${idFragment}
                nugg ${idFragment}
                eth
                ethUsd
                claimed
                owner
            }
            swaps ${idFragment}
            activeSwap ${idFragment}
        }
        offers {
            id
            user ${idFragment}
            eth
            ethUsd
            claimed
            owner
        }
        epoch {
            id
            endblock
        }
        eth
        ethUsd
        owner ${idFragment}
        leader ${idFragment}
    }
`;

export const swapThumbnail = gql`
    {
        id
        endingEpoch
        eth
        ethUsd
        owner ${idFragment}
        leader ${idFragment}
        nugg ${idFragment}
    }
`;

export const swapNuggId = gql`
    {
        nugg ${idFragment}
    }
`;
