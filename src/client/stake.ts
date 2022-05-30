/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine } from 'zustand/middleware';
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';
import React from 'react';

import { EthInt, Fraction } from '@src/classes/Fraction';
import { calculateMsp } from '@src/web3/config';

const store = create(
    combine(
        {
            shares: BigNumber.from(0),
            eth: BigNumber.from(0),
        },
        (set) => {
            const update = (shares: BigNumber, eth: BigNumber) => {
                set(() => {
                    return {
                        shares,
                        eth,
                    };
                });
            };

            return { update };
        },
    ),
);

export default {
    useShares: () => store((draft) => draft.shares),
    useEth: () => store((draft) => draft.eth),
    useUpdate: () => store((draft) => draft.update),
    useEps: () => {
        const eth = store((draft) => draft.eth);
        const shares = store((draft) => draft.shares);
        return React.useMemo(() => {
            return EthInt.fromFraction(new Fraction(eth, shares));
        }, [eth, shares]);
    },
    useMsp: () => {
        const eth = store((draft) => draft.eth);
        const shares = store((draft) => draft.shares);
        return React.useMemo(() => {
            return calculateMsp(shares, eth);
        }, [eth, shares]);
    },
    ...store,
};
