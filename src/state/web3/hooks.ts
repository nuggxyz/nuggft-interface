import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { DependencyList, useCallback, useEffect, useState } from 'react';

import { Address, EnsAddress } from '../../classes/Address';
import { NetworkContextName } from '../../config';
import {
    isUndefinedOrNullOrBooleanFalse,
    isUndefinedOrNullOrObjectEmpty,
    loadFromLocalStorage,
    saveToLocalStorage,
} from '../../lib';
import store from '../store';

const useActiveWeb3React = () => {
    const context = useWeb3React<Web3Provider>();
    const contextNetwork = useWeb3React<Web3Provider>(NetworkContextName);
    return context.active ? context : contextNetwork;
};

/**
 * Given a name or address, does a lookup to resolve to an address and name
 * @param nameOrAddress ENS name or address
 */
const useEns = (address: string, deps?: DependencyList): string => {
    const [addr, setAddr] = useState('');

    const getData = useCallback(async () => {
        if (address && Address.ZERO.hash !== address) {
            let storage = {};
            if (address === store.getState().web3.web3address) {
                storage = loadFromLocalStorage('ens', false) || {};
            }
            const ensAddress = new EnsAddress(address);
            if (!isUndefinedOrNullOrObjectEmpty(storage)) {
                setAddr(storage[store.getState().web3.currentChain]);
            } else {
                setAddr(Address.shortenAddress(ensAddress));
            }
            await ensAddress.ensureEns();
            setAddr(ensAddress.short);
            if (address === store.getState().web3.web3address) {
                storage[store.getState().web3.currentChain] = ensAddress.short;
                saveToLocalStorage(storage, 'ens', false);
            }
        } else {
            setAddr(undefined);
        }
    }, deps);

    useEffect(() => {
        getData();
    }, [getData]);

    return addr;
};

export default { useActiveWeb3React, useEns };
