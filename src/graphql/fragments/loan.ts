import gql from 'graphql-tag';
import { idFragment } from './general';

export const loanBare = gql`
{
    id
    nugg ${idFragment}
    endingEpoch
    eth
    ethUsd
    feeEth
    feeUsd
    liquidated
    liquidatedForEth
    liquidatedForUsd
}`;
