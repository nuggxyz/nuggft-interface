declare namespace NL.Redux.Socket {
    interface State {
        Offer: import('./interfaces').OfferInfo;
        ItemOffer: import('./interfaces').ItemOfferInfo;
        Mint: import('./interfaces').MintInfo;
        Stake: import('./interfaces').StakeInfo;
        Claim: import('./interfaces').ClaimInfo;
        Block: import('./interfaces').BlockInfo;
        swapsToWatch: string[];
    }

    type Error = 'ERROR';
}
