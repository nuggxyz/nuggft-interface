import React, { useCallback, useEffect, useState } from 'react';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';

import {
    isUndefinedOrNullOrStringEmpty,
    loadStringFromLocalStorage,
} from '../../lib';
import { NetworkContextName } from '../../config';
import useSetWeb3Account from '../../hooks/useSetWeb3Account';
import useSetWeb3Listeners from '../../hooks/useSetWeb3Listeners';
import useAsyncState from '../../hooks/useAsyncState';

import Web3Config from './Web3Config';

import Web3State from '.';

export default () => {
    const { activate: activateNetwork, active: activeNetwork } =
        useWeb3React(NetworkContextName);
    const {
        activate: defaultActivate,
        account: web3Account,
        deactivate,
        active,
        error,
        chainId: connectorChainId,
        library,
    } = useWeb3React();

    const chainId = Web3State.select.currentChain();

    useSetWeb3Listeners({
        chainId,
        library,
        activateNetwork,
        connectorChainId,
    });

    useSetWeb3Account({ web3Account, library });

    useEffect(() => {
        if (defaultActivate && !active) {
            const safeActivate = Web3State.safeActivate(defaultActivate);
            if (
                !window.ethereum &&
                !isUndefinedOrNullOrStringEmpty(
                    loadStringFromLocalStorage('walletconnect'),
                )
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
