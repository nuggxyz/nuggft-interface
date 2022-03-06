import gql from 'graphql-tag';
import { idFragment } from './general';
import { itemOfferBare } from './itemOffer';
import { swapThumbnail } from './swap';
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
        items {
            activeSwap {
                id
            }
            item {
                id
                dotnuggRawCache
                feature
            }
        }
        swaps (orderBy: id, orderDirection: desc) ${swapThumbnail}
        activeSwap ${idFragment}
        activeLoan ${idFragment}
    }
`;

export const nuggUser = gql`
    {
        id
        user ${idFragment}
    }
`;

export const nuggListItem = gql`
    {
        id
        dotnuggRawCache
    }
`;
