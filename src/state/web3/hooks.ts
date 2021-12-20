import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect, useState } from 'react';

import { EnsAddress } from '../../classes/Address';
import { NetworkContextName } from '../../config';

const useActiveWeb3React = () => {
    const context = useWeb3React<Web3Provider>();
    const contextNetwork = useWeb3React<Web3Provider>(NetworkContextName);
    return context.active ? context : contextNetwork;
};

/**
 * Given a name or address, does a lookup to resolve to an address and name
 * @param nameOrAddress ENS name or address
 */
const useEns = (address: string): EnsAddress => {
    const [addr, setAddr] = useState<EnsAddress>();

    const getData = useCallback(async () => {
        if (address) {
            const ensAddress = new EnsAddress(address);
            await ensAddress.ensureEns();
            setAddr(ensAddress);
        }
    }, [address]);

    useEffect(() => {
        getData();
    }, [getData]);

    return addr;
};

const Web3Hooks = { useActiveWeb3React, useEns };

export default Web3Hooks;
