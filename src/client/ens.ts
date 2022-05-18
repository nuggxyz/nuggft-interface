/* eslint-disable no-param-reassign */
import React from 'react';
import create from 'zustand';
import { combine, persist } from 'zustand/middleware';
import { Web3Provider } from '@ethersproject/providers';

import lib from '@src/lib/index';
import { Address } from '@src/classes/Address';

const useStore = create(
    persist(
        combine({} as { [_: Lowercase<AddressString>]: string | number }, (set) => {
            const setTtl = (address: AddressString) => {
                // @ts-ignore
                set((draft) => {
                    if (typeof draft[address] !== 'string')
                        draft[address] = lib.date.getUnix() + 60 * 60 * 24; // one day
                });
            };
            const update = (address: AddressString, ens: string | null) => {
                if (!ens) {
                    setTtl(address);
                    return;
                }
                address = address.toLowerCase() as Lowercase<AddressString>;
                // @ts-ignore
                set((draft) => {
                    if (draft[address] !== ens) draft[address] = ens;
                });
            };

            return { update, setTtl };
        }),
        { name: 'nugg.xyz-ens' },
    ),
);

const useUpdatePersistedEns = () => useStore((state) => state.update);

const usePersistedEnsRaw = (address?: Lowercase<AddressString>) => {
    return useStore(
        React.useCallback(
            (state) =>
                state[address ? (address.toLowerCase() as Lowercase<AddressString>) : '0x'] ||
                undefined,
            [address],
        ),
    );
};
const useEns = (provider?: Web3Provider, address?: Lowercase<AddressString>) => {
    const me = usePersistedEnsRaw(address);
    const update = useUpdatePersistedEns();

    React.useEffect(() => {
        if (!provider) return;

        address = address?.toLowerCase() as Lowercase<AddressString> | undefined;

        if (!address || address.isNuggId()) return;

        if (me === undefined || (typeof me === 'number' && new Date().getTime() < me)) {
            void provider
                .lookupAddress(address as AddressString)
                .then((result) => {
                    console.log({ result });
                    update(address as AddressString, result);
                })
                .catch(() => {
                    update(address as AddressString, null);
                });
        }
    }, [me, address, provider]);

    if (!provider) return undefined;
    if (!address) return undefined;
    if (me === undefined || typeof me === 'number') return Address.shortenAddressHash(address);
    if (typeof me === 'string') {
        if (me.startsWith('0x')) return Address.shortenAddressHash(address);
        return me;
    }

    return undefined;
};

export default {
    useEns,
    useStore,
};
