import React, { useCallback, useMemo } from 'react';
import Davatar from '@davatar/react';

import Button from '../Button/Button';
import { isUndefinedOrNullOrObjectEmpty } from '../../../../lib';
import Web3Config from '../../../../state/web3/config';
import Loader from '../../Loader/Loader';
import Colors from '../../../../lib/colors';
import NLStaticImage from '../../NLStaticImage';
import Web3Selectors from '../../../../state/web3/selectors';
import Web3Helpers from '../../../../state/web3/helpers';
import Web3Hooks from '../../../../state/web3/hooks';
import Web3Dispatches from '../../../../state/web3/dispatches';

import styles from './LinkAccountButton.styles';

const Identicon = () => {
    const address = Web3Selectors.web3address();
    const library = useMemo(
        () => Web3Helpers.getLibraryOrProvider(),
        [address],
    );

    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    return (
        address &&
        library?.provider && (
            <Davatar address={address} size={16} provider={library.provider} />
        )
    );
};

const LinkAccountButton = () => {
    const address = Web3Selectors.web3address();
    const status = Web3Selectors.web3status();
    const ens = Web3Hooks.useEns(address);

    const buttonLabel = useMemo(() => {
        if (status === 'SELECTED') {
            return !isUndefinedOrNullOrObjectEmpty(ens)
                ? ens.short
                : 'Loading ENS';
        } else if (status === 'ERROR') {
            return 'Error';
        } else if (status === 'PENDING') {
            return 'Check your MetaMask';
        } else {
            return 'Connect to MetaMask';
        }
    }, [status, ens]);

    const buttonStyle = useMemo(() => {
        return {
            ...styles.button,
            ...(status === 'ERROR' ? styles.statusError : {}),
        };
    }, [status]);

    const onClick = useCallback(() => {
        if (status !== 'SELECTED') {
            Web3Helpers.safeActivate(Web3Config.connectors.injected);
        }
        if (status === 'SELECTED') {
            Web3Helpers.deactivate();
            Web3Dispatches.clearWeb3Address();
        }
    }, [status]);

    const getRightIcon = useCallback(
        () => (
            <div style={styles.iconWrapper}>
                {(status === 'SELECTED' &&
                    isUndefinedOrNullOrObjectEmpty(ens)) ||
                status === 'PENDING' ? (
                    <Loader color={Colors.nuggBlueText} />
                ) : status === 'SELECTED' ? (
                    <Identicon />
                ) : status === 'NOT_SELECTED' ? (
                    <NLStaticImage image="metamask" />
                ) : null}
            </div>
        ),
        [status, ens],
    );

    return (
        <Button
            buttonStyle={buttonStyle}
            textStyle={styles.text}
            onClick={onClick}
            label={buttonLabel}
            rightIcon={getRightIcon()}
        />
    );
};

export default LinkAccountButton;
