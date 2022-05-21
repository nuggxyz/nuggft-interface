/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine } from 'zustand/middleware';
import React from 'react';

import { EthInt, PairInt, Fractionish } from '@src/classes/Fraction';
import emitter from '@src/emitter';

const store = create(
    combine(
        {
            price: 0,
            preference: 'USD' as 'ETH' | 'USD',
            error: false,
            errorStart: null as number | null,
        },
        (set, get) => {
            const setCurrencyPreference = (input: 'USD' | 'ETH') => {
                set(() => ({
                    preference: input,
                }));
            };

            const update = (price: number | null) => {
                try {
                    if (price === 0) throw Error();
                    if (price === null) throw Error();

                    if (price !== get().price)
                        set(() => ({
                            price: Number(price.toFixed(2)),
                            error: false,
                        }));
                } catch {
                    const { errorStart, price: prevPrice, error } = get();
                    if (!error) {
                        if (errorStart === null) {
                            set(() => ({
                                errorStart: new Date().getTime(),
                                ...(prevPrice === 0 && { error: true }),
                            }));
                        } else if (new Date().getTime() - errorStart > 60000) {
                            set(() => ({
                                error: true,
                            }));
                        }
                    }
                }
            };

            const watch = emitter.on.bind(emitter, {
                type: emitter.events.IncomingEtherscanPrice,
                callback: (arg) => {
                    update(arg.data);
                },
            });

            return { setCurrencyPreference, watch };
        },
    ),
);

store.getState().watch();

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
