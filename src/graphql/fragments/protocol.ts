import gql from 'graphql-tag';
import { epochFull } from './epoch';
import { idFragment } from './general';
// import { nuggFull } from './nugg';
// import { nuggItemFull } from './nuggItem';
import { userBare } from './user';

// export const protocolFull = gql`
//     {
//         id
//         epoch ${epochFull}
//         totalSwaps 
//         totalUsers 
//         totalNuggs 
//         totalItems 
//         totalItemSwaps 
//         genesisBlock 
//         interval 
//         xnuggUser ${userBare}
//         nuggftUser ${userBare}
//         nullUser ${userBare}
//         xnuggTotalSupply
//         xnuggTotalEth
//         nuggftTotalEth
//         nuggftStakedUsdPerShare
//         nuggftStakedUsd
//         nuggftStakedEthPerShare
//         nuggftStakedEth
//         nuggftStakedShares
//         priceUsdcWeth
//         priceWethXnugg
//         tvlEth
//         tvlUsd
//         defaultActiveNugg ${idFragment}
//         activeNuggs ${idFragment}
//         activeItems ${idFragment}
//     }
// `;

export const protocolPrices = gql`
    {
        xnuggTotalSupply
        xnuggTotalEth
        nuggftTotalEth
        priceUsdcWeth
        priceWethXnugg
        tvlEth
        tvlUsd
    }
`;

export const protocolActives = gql`
{
    defaultActiveNugg ${idFragment}
    activeNuggs ${idFragment}
    activeItems ${idFragment}
}`;

export const protocolTotals = gql`
    {
        totalSwaps
        totalUsers
        totalNuggs
        totalItems
        totalItemSwaps
    }
`;

export const protocolEpochs = gql`
    {
        genesisBlock
        interval
        epoch ${epochFull}
        lastBlock
    }
`;

export const protocolUsers = gql`
    {
        xnuggUser ${userBare}
        nuggftUser ${userBare}
        nullUser ${userBare}
    }
`;

export const protocolStaked = gql`
    {
        nuggftStakedUsdPerShare
        nuggftStakedUsd
        nuggftStakedEthPerShare
        nuggftStakedEth
        nuggftStakedShares
    }
`;
