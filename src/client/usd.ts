/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine } from 'zustand/middleware';
import React from 'react';
import { EtherscanProvider } from '@ethersproject/providers';

import { EthInt, UsdInt, PairInt, Fractionish } from '@src/classes/Fraction';

const etherscan = new EtherscanProvider('mainnet', process.env.NUGG_APP_ETHERSCAN_KEY as string);

const store = create(
    combine(
        {
            price: new UsdInt(0),
            preference: 'USD' as 'ETH' | 'USD',
        },
        (set) => {
            const update = async () => {
                const price = await etherscan.getEtherPrice();
                set((draft) => {
                    draft.price = new UsdInt(price);
                });
            };

            const poll = () => {
                setInterval(() => {
                    void update();
                }, 60000);
            };

            const now = () => {
                void update();
            };

            const setCurrencyPreference = (input: 'USD' | 'ETH') => {
                set((draft) => {
                    draft.preference = input;
                });
            };

            return { poll, now, setCurrencyPreference };
        },
    ),
);

store.getState().now();

store.getState().poll();

export const useUsdPair = (input?: Fractionish | undefined | null) => {
    const price = store((state) => state.price);

    const preference = store((state) => state.preference);

    return React.useMemo(() => {
        if (!input) return PairInt.fromUsdPrice(new EthInt(0), price, preference);

        return PairInt.fromUsdPrice(input, price, preference);
    }, [price, input, preference]);
};

export const useUsdPairWithCalculation = <T extends Fractionish, R extends number>(
    input: FixedLengthArray<T, R>,
    callback: <G extends EthInt>(arg: FixedLengthArray<G, R>) => G,
) => {
    const price = store((state) => state.price);

    const preference = store((state) => state.preference);

    return React.useMemo(() => {
        const abc = input.map((x) => EthInt.tryParseFrac(x)) as unknown as FixedLengthArray<
            EthInt,
            R
        >;

        const eths = callback(abc);

        return PairInt.fromUsdPrice(eths, price, preference);
    }, [price, input, preference, callback]);
};

export default {
    useUsd: () => store((state) => state.price),
    useCurrencyPreferrence: () => store((state) => state.preference),

    useSetCurrencyPreferrence: () => store((state) => state.setCurrencyPreference),

    useUsdPair,
    ...store,
};
