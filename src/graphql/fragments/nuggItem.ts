import gql from 'graphql-tag';
import { idFragment } from './general';
import { itemFull, itemThumbnail } from './item';
import { itemSwapThumbnail } from './itemSwap';
import { swapThumbnail } from './swap';
// import { itemSwapFull } from './itemSwap';
// import { nuggFull } from './nugg';
// import { protocolFull } from './protocol';

// export const nuggItemFull = gql`
//     {
//         id
//         item ${itemFull}
//         nugg ${nuggFull}
//         count
//         activeSwap ${itemSwapFull}
//         protocol ${protocolFull}
//         swaps ${itemSwapFull}
//     }
// `;

export const nuggItemThumbnail = gql`
    {
        id
        nugg ${idFragment}
        swaps (orderBy: id, orderDirection: desc) ${itemSwapThumbnail}
        activeSwap ${idFragment}
    }
`;
