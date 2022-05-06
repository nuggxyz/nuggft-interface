/* eslint-disable no-param-reassign */
import React from 'react';
import create from 'zustand';
import { combine, persist } from 'zustand/middleware';
import shallow from 'zustand/shallow';

const useStore = create(
    persist(
        combine({} as { [_: AddressString]: string }, (set) => {
            const update = (address: AddressString, ens: string) => {
                set((draft) => {
                    if (draft[address] !== ens) draft[address] = ens;
                });
            };

            return { update };
        }),
        { name: 'nugg.xyz-ens' },
    ),
);

const useUpdatePersistedEns = (address?: AddressString) =>
    useStore(
        React.useCallback((state) => state.update.bind(undefined, address || '0x'), [address]),
    );

const usePersistedEns = (address?: AddressString) =>
    useStore(
        React.useCallback(
            (state) => (address !== undefined ? state[address] : undefined),
            [address],
        ),
        shallow,
    );

export default {
    useUpdatePersistedEns,
    usePersistedEns,
    useStore,
};
