import gql from 'graphql-tag';
import { idFragment } from './general';
import { itemOfferBare } from './itemOffer';
// import { nuggItemFull } from './nuggItem';
// import { protocolFull } from './protocol';
// import { swapFull, swapThumbnail } from './swap';
// import { userFull } from './user';

// export const nuggFull = gql`
//     {
//         id
//         user ${userFull}
//         activeSwap ${swapFull}
//         protocol ${protocolFull}
//         swaps ${swapFull}
//         items ${nuggItemFull}
//         offers ${itemOfferFull}
//     }
// `;

export const nuggBare = gql`
    {
        id
        user ${idFragment}
        items ${idFragment}
        offers ${itemOfferBare}
        swaps ${idFragment}
        activeSwap ${idFragment}
    }
`;

// TODO Figure out why importing swapThumbnail throws a gql error
export const nuggThumbnail = gql`
    {
        id
        user ${idFragment}
        items ${idFragment}
        swaps (first: 1, orderBy: id, orderDirection: desc) {
            id
            eth
            ethUsd
            owner ${idFragment}
            leader ${idFragment}
        }
        activeSwap ${idFragment}
    }
`;

export const nuggListItem = gql`
    {
        id
        dotnuggRawCache
    }
`;
