import gql from 'graphql-tag';
import { idFragment } from './general';
// import { swapFull, swapThumbnail } from './swap';
// import { userFull } from './user';

// export const offerFull = gql`
//     {
//         id
//         swap ${swapFull}
//         user ${userFull}
//         eth
//         ethUsd
//         claimed
//         owner
//     }
// `;

export const offerBare = gql`
{
    id
    user ${idFragment}
    eth
    ethUsd
    claimed
    owner
}`;

export const offerThumbnail = gql`
    {
        id
        user ${idFragment}
        swap (where: {claimed: false}) {
            id
            eth
            ethUsd
            owner ${idFragment}
            leader ${idFragment}
            num
        }
        eth
        ethUsd
        claimed
        owner
    }
`;
