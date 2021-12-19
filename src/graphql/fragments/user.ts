import gql from 'graphql-tag';
import { idFragment } from './general';
// import { nuggFull } from './nugg';
// import { offerFull } from './offer';

// export const userFull = gql`
//     {
//         id
//         xnugg
//         ethin
//         ethout
//         nuggs ${nuggFull}
//         offers ${offerFull}
//     }
// `;

export const userBare = gql`
{
    id
    xnugg
    ethin
    ethout
    nuggs ${idFragment}
    offers ${idFragment}
}`;
