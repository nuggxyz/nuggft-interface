/* eslint-disable no-param-reassign */
import React from 'react';
import create from 'zustand';
import { combine, persist } from 'zustand/middleware';
import shallow from 'zustand/shallow';

import lib from '@src/lib/index';

const useStore = create(
    persist(
        combine({} as { [_: Lowercase<AddressString>]: string | number }, (set) => {
            const update = (address: AddressString, ens: string) => {
                address = address.toLowerCase() as Lowercase<AddressString>;
                set((draft) => {
                    if (draft[address] !== ens) draft[address] = ens;
                });
            };

            const setTtl = (address: AddressString) => {
                set((draft) => {
                    if (typeof draft[address] !== 'string')
                        draft[address] = lib.date.getUnix() + 60 * 60 * 24; // one day
                });
            };

            return { update, setTtl };
        }),
        { name: 'nugg.xyz-ens' },
    ),
);

const useUpdatePersistedEns = (address?: Lowercase<AddressString>) =>
    useStore(
        React.useCallback((state) => state.update.bind(undefined, address || '0x'), [address]),
    );

const usePersistedEns = (address?: Lowercase<AddressString>) =>
    useStore(
        React.useCallback(
            (state): string | undefined => {
                address = address?.toLowerCase() as Lowercase<AddressString> | undefined;

                if (!address || address.isNuggId()) return undefined;

                if (
                    !state[address] ||
                    (typeof state[address] === 'number' && new Date().getTime() < state[address])
                ) {
                    state.setTtl(address);
                    return undefined;
                }
                if (typeof state[address] === 'number') return undefined;

                return state[address] as string;
            },
            [address],
        ),
        shallow,
    );

export default {
    useUpdatePersistedEns,
    usePersistedEns,
    useStore,
};
