/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine } from 'zustand/middleware';
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';

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
    useEps: () => store((draft) => EthInt.fromFraction(new Fraction(draft.eth, draft.shares))),
    useMsp: () => store((draft) => calculateMsp(draft.shares, draft.eth)),
    ...store,
};
