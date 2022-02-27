/* eslint-disable react-hooks/exhaustive-deps */

import React from 'react';

import { BlockInfo, ClaimInfo, MintInfo, OfferInfo, StakeInfo } from './interfaces';

import SocketState from './index';

function useSocket<SocketInfo>(
    hook: () => SocketInfo,
    callback: (info: SocketInfo) => void,
    deps: any[] = [],
) {
    const data = hook();

    const cb = React.useCallback(callback, [data, callback]);

    React.useEffect(() => {
        data && cb(data);
    }, [data]);

    return null;
}

export const useOffer = (callback: (info: OfferInfo) => void) => {
    return useSocket(SocketState.select.Offer, callback);
};

export const useMint = (callback: (info: MintInfo) => void) => {
    return useSocket(SocketState.select.Mint, callback);
};

export const useClaim = (callback: (info: ClaimInfo) => void) => {
    return useSocket(SocketState.select.Claim, callback);
};

export const useBlock = (callback: (info: BlockInfo) => void) => {
    return useSocket(SocketState.select.Block, callback);
};

export const useStake = (callback: (info: StakeInfo) => void) => {
    return useSocket(SocketState.select.Stake, callback);
};

export const useLiveOffers = (tokenId: string, starting: NL.Redux.Offer[]) => {
    const [leader, setLeader] = React.useState<NL.Redux.Offer>(undefined);

    const [offers, setOffers] = React.useState<NL.Redux.Offer[]>(undefined);

    useOffer((x) => {
        if (+x.tokenId === +tokenId) {
            const input = { user: x.account, eth: x.value };

            setLeader(input);
            setOffers([input, ...(offers ? offers : []).filter((y) => y.user !== x.account)]);
        }
    });

    React.useEffect(() => {
        setOffers(starting);
        starting && starting.length > 0 && setLeader(starting[0]);

        return () => {
            setOffers(undefined);
            setLeader(undefined);
        };
    }, [tokenId, starting]);

    return { leader, offers };
};

export default {
    useClaim,
    useOffer,
    useBlock,
    useStake,
    useMint,
    useLiveOffers,
};
