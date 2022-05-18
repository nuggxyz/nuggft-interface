/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine } from 'zustand/middleware';
import React from 'react';

import { EthInt, PairInt, Fractionish } from '@src/classes/Fraction';
import { CustomEtherscanProvider } from '@src/web3/classes/CustomEtherscanProvider';
import { Chain } from '@src/web3/core/interfaces';

const etherscan = new CustomEtherscanProvider(Chain.MAINNET);

const store = create(
    combine(
        {
            price: 0,
            preference: 'USD' as 'ETH' | 'USD',
            error: false,
        },
        (set) => {
            const update = async () => {
                try {
                    const price = await etherscan.getEtherPrice();
                    if (price === 0) throw Error();

                    set(() => ({
                        price: Number(price.toFixed(2)),
                        error: false,
                    }));
                } catch {
                    set(() => ({
                        error: true,
                    }));
                }
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
                set(() => ({
                    preference: input,
                }));
            };

            return { poll, now, setCurrencyPreference };
        },
    ),
);

store.getState().now();

store.getState().poll();

const useCurrencyPreferrence = () => store((state) => (state.error ? 'ETH' : state.preference));
const useUsdError = () => store((state) => state.error);

export const useUsdPair = (input?: Fractionish | undefined | null) => {
    const price = store((state) => state.price);

    const preference = useCurrencyPreferrence();

    return React.useMemo(() => {
        if (!input) return PairInt.fromUsdPrice(0, price, preference);

        return PairInt.fromUsdPrice(input, price, preference);
    }, [price, input, preference]);
};

export const useUsdPairWithCalculation = <T extends Fractionish, R extends number>(
    input: FixedLengthArray<T, R>,
    callback: (arg: FixedLengthArray<Readonly<EthInt>, R>) => EthInt,
) => {
    const price = store((state) => state.price);

    const preference = useCurrencyPreferrence();

    return React.useMemo(() => {
        const abc = input.map((x) =>
            Object.freeze(EthInt.tryParseFrac(x)),
        ) as unknown as FixedLengthArray<EthInt, R>;

        const eths = callback(abc);

        return PairInt.fromUsdPrice(eths, price, preference);
    }, [price, input, preference, callback]);
};

export default {
    useUsd: () => store((state) => state.price),
    useCurrencyPreferrence,
    useSetCurrencyPreferrence: () => store((state) => state.setCurrencyPreference),
    useUsdPair,
    useUsdError,
    ...store,
};
