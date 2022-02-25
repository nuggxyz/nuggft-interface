import { useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';

import { isUndefinedOrNullOrStringEmpty, loadStringFromLocalStorage } from '../../lib';
import { NetworkContextName } from '../../config';

import Web3Config from './Web3Config';

import Web3State from '.';

export default () => {
    const { activate: activateNetwork } = useWeb3React(NetworkContextName);
    const { activate: defaultActivate, account: web3Account, active, library } = useWeb3React();

    Web3State.hook.useWeb3Listeners();

    Web3State.hook.useSetWeb3Account();

    useEffect(() => {
        if (defaultActivate && !active) {
            const safeActivate = Web3State.safeActivate(defaultActivate);
            if (
                !window.ethereum &&
                !isUndefinedOrNullOrStringEmpty(loadStringFromLocalStorage('walletconnect'))
            ) {
                safeActivate(Web3Config.connectors.walletconnect);
            } else {
                safeActivate(Web3Config.connectors.injected);
            }
        }
        if (activateNetwork) {
            activateNetwork(Web3Config.connectors.network);
        }
    }, [active, activateNetwork, defaultActivate]);
    return null;
};
