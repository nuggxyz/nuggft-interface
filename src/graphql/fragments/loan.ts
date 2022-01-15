import gql from 'graphql-tag';
import { idFragment } from './general';

export const loanBare = gql`
    {
        id
        nugg {
            id
            dotnuggRawCache
        }
        endingEpoch
        eth
        ethUsd
        feeEth
        feeUsd
        liquidated
        liquidatedForEth
        liquidatedForUsd
    }
`;
