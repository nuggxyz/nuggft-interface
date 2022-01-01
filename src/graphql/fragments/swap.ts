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

export const swapBare = gql`
    {
        id
        num
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
        eth
        ethUsd
        owner ${idFragment}
        leader ${idFragment}
    }
`;

export const swapBareWithEpoch = gql`
    {
        id
        num
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
        endingEpoch
        epoch {
            id
            endblock
            startblock
        }
        startingEpoch {
            id
            endblock
            startblock
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
        num
        eth
        ethUsd
        owner ${idFragment}
        leader ${idFragment}
        nugg ${idFragment}
    }
`;
export const swapThumbnailActiveSales = gql`
    {
        id
        endingEpoch
        num
        eth
        ethUsd
        offers(first: 1, orderBy: eth, orderDirection: desc, where: {claimed: false}) {
            id
        }
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
