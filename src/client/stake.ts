/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine } from 'zustand/middleware';
import { BigNumber } from 'ethers';

import { EthInt, Fraction } from '@src/classes/Fraction';
import { PREMIUM_DIV, PROTOCOL_FEE_FRAC_MINT } from '@src/web3/constants';

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

const buildMsp = (shares: BigNumber, eth: BigNumber) => {
    const ethPerShare = new Fraction(eth, shares);
    const protocolFee = ethPerShare.divide(PROTOCOL_FEE_FRAC_MINT);
    const premium = ethPerShare.multiply(shares).divide(PREMIUM_DIV);
    return ethPerShare.add(protocolFee).add(premium);
};

export default {
    useShares: () => store((draft) => draft.shares),
    useEth: () => store((draft) => draft.eth),
    useUpdate: () => store((draft) => draft.update),
    useEps: () => store((draft) => EthInt.fromFraction(new Fraction(draft.eth, draft.shares))),
    useMsp: () => store((draft) => buildMsp(draft.eth, draft.shares)),
    ...store,
};
