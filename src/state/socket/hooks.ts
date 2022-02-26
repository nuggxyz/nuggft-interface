/* eslint-disable react-hooks/exhaustive-deps */

import React from 'react';

import { BlockInfo, ClaimInfo, MintInfo, OfferInfo, StakeInfo } from './interfaces';

import SocketState from './index';

function useSocket<SocketInfo>(hook: () => SocketInfo, callback: (info: SocketInfo) => void) {
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

export default {
    useClaim,
    useOffer,
    useBlock,
    useStake,
    useMint,
};
