import React, { useCallback, useEffect, useState } from 'react';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { BigNumber } from 'ethers';
import { batch } from 'react-redux';

import {
    isUndefinedOrNull,
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrNotFunction,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../lib';
import NuggftV1Helper from '../../contracts/NuggftV1Helper';
import NuggDexState from '../nuggdex';
import ProtocolState from '../protocol';
import SwapState from '../swap';
import TokenState from '../token';
import TransactionState from '../transaction';
import WalletState from '../wallet';
import GQLHelper from '../../graphql/GQLHelper';
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

    const web3address = Web3State.select.web3address();
    const chainId = Web3State.select.currentChain();

    useSetWeb3Listeners({
        chainId,
        library,
        activateNetwork,
        connectorChainId,
    });

    useSetWeb3Account({ web3Account, library });

    useEffect(() => {
        if (!isUndefinedOrNullOrObjectEmpty(error)) {
            Web3State.dispatch.setWeb3Status('ERROR');
        }
    }, [error]);

    useEffect(() => {
        console.log(typeof defaultActivate, typeof activateNetwork);
        if (defaultActivate) {
            Web3State.safeActivate(defaultActivate)(
                Web3Config.connectors.injected,
            );
        } else if (activateNetwork) {
            console.log('NETWORK ');
            activateNetwork(Web3Config.connectors.network);
            Web3State.dispatch.setWeb3Status('NOT_SELECTED');
            // }
        }
    }, [active, activateNetwork, defaultActivate]);
    return null;
};
