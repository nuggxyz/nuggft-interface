import { useEffect } from 'react';

import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../lib';
import Web3State from '../state/web3';

const useSetWeb3Account = ({ web3Account, library }) => {
    const web3address = Web3State.select.web3address();

    useEffect(() => {
        if (isUndefinedOrNullOrObjectEmpty(web3address)) {
            if (!isUndefinedOrNullOrObjectEmpty(window.ethereum)) {
                if (
                    !isUndefinedOrNullOrObjectEmpty(window.ethereum._state) &&
                    !isUndefinedOrNullOrArrayEmpty(
                        window.ethereum._state.accounts,
                    )
                ) {
                    Web3State.dispatch.setWeb3Address(
                        window.ethereum._state.accounts[0],
                    );
                } else if (
                    !isUndefinedOrNullOrObjectEmpty(
                        window.ethereum.selectedProvider,
                    ) &&
                    !isUndefinedOrNullOrStringEmpty(
                        window.ethereum.selectedProvider.selectedAddress,
                    )
                ) {
                    Web3State.dispatch.setWeb3Address(
                        window.ethereum.selectedProvider.selectedAddress,
                    );
                } else if (
                    !isUndefinedOrNullOrStringEmpty(
                        window.ethereum.selectedAddress,
                    )
                ) {
                    Web3State.dispatch.setWeb3Address(
                        window.ethereum.selectedAddress,
                    );
                } else if (!isUndefinedOrNullOrStringEmpty(web3Account)) {
                    Web3State.dispatch.setWeb3Address(web3Account);
                }
            } else if (!isUndefinedOrNullOrStringEmpty(web3Account)) {
                Web3State.dispatch.setWeb3Address(web3Account);
                Web3State._walletConnectSigner =
                    library?.getSigner(web3Account);
            }
        }
    }, [web3address, web3Account, library]);
};

export default useSetWeb3Account;
