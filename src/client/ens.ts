/* eslint-disable no-param-reassign */
import React from 'react';
import create from 'zustand';
import { combine, persist } from 'zustand/middleware';
import shallow from 'zustand/shallow';

import lib, { shortenAddress } from '@src/lib/index';

const useStore = create(
    persist(
        combine({} as { [_: Lowercase<AddressString>]: string | number }, (set, get) => {
            const update = (address: AddressString, ens: string) => {
                address = address.toLowerCase() as Lowercase<AddressString>;
                const a = get();
                console.log({ ...a });
                set((draft) => {
                    if (draft[address] !== ens) draft[address] = ens;
                    return draft;
                });
                const b = get();
                console.log({ ...b });
            };

            const setTtl = (address: AddressString) => {
                set((draft) => {
                    if (typeof draft[address] !== 'string')
                        draft[address] = lib.date.getUnix() + 60 * 60 * 24; // one day
                    return draft;
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
                if (typeof state[address] === 'number') return shortenAddress(address);

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
