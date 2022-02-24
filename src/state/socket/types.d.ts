declare namespace NL.Redux.Socket {
    interface State {
        Offer: import('./interfaces').OfferInfo;
        Mint: import('./interfaces').MintInfo;
        Stake: import('./interfaces').StakeInfo;
        Claim: import('./interfaces').ClaimInfo;
    }

    type Error = 'ERROR';
}
