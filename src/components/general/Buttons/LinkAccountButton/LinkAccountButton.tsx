import React, { useCallback, useMemo } from 'react';
import Davatar from '@davatar/react';
import { useWeb3React } from '@web3-react/core';

import Button from '../Button/Button';
import { isUndefinedOrNullOrObjectEmpty } from '../../../../lib';
import Web3State from '../../../../state/web3';
import Web3Config from '../../../../state/web3/Web3Config';
import Loader from '../../Loader/Loader';
import Colors from '../../../../lib/colors';
import NLStaticImage from '../../NLStaticImage';

import styles from './LinkAccountButton.styles';

const Identicon = () => {
    const address = Web3State.select.web3address();
    const library = useMemo(() => Web3State.getLibraryOrProvider(), [address]);

    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    return (
        address &&
        library?.provider && (
            <Davatar address={address} size={16} provider={library.provider} />
        )
    );
};

const LinkAccountButton = () => {
    const address = Web3State.select.web3address();
    const status = Web3State.select.web3status();
    const ens = Web3State.hook.useEns(address);

    const buttonLabel = useMemo(() => {
        if (status === 'SELECTED') {
            return !isUndefinedOrNullOrObjectEmpty(ens)
                ? ens.short
                : 'Loading ENS';
        } else if (status === 'ERROR') {
            return 'Error';
        } else if (status === 'PENDING') {
            return 'Check your wallet';
        } else {
            return 'Connect to nugg.xyz';
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
            // Web3State.safeActivate(Web3Config.connectors.injected);
        }
        if (status === 'SELECTED') {
            Web3State.deactivate();
            Web3State.dispatch.clearWeb3Address();
        }
    }, [status]);

    const getRightIcon = useCallback(
        () => (
            <div style={styles.iconWrapper}>
                {
                    (status === 'SELECTED' &&
                        isUndefinedOrNullOrObjectEmpty(ens)) ||
                    status === 'PENDING' ? (
                        <Loader color={Colors.nuggBlueText} />
                    ) : status === 'SELECTED' ? (
                        <Identicon />
                    ) : status === 'NOT_SELECTED' ? (
                        <NLStaticImage image="nugg" />
                    ) : null //
                }
            </div>
        ),
        [status, ens],
    );

    return (
        <>
            <>
                {Object.values(Web3Config.SUPPORTED_WALLETS).map(
                    (walletObject) =>
                        walletObject.name !== 'MetaMask' ||
                        (walletObject.name === 'MetaMask' &&
                            window.ethereum) ? (
                            <Button
                                buttonStyle={{
                                    ...buttonStyle,
                                    background: `${walletObject.color}66`,
                                }}
                                rightIcon={
                                    //@ts-ignore
                                    <NLStaticImage image={walletObject.name} />
                                }
                                onClick={() =>
                                    Web3State.safeActivate(
                                        walletObject.connector,
                                    )
                                }
                            />
                        ) : null,
                )}
            </>
            <Button
                buttonStyle={buttonStyle}
                textStyle={styles.text}
                onClick={onClick}
                label={buttonLabel}
                rightIcon={getRightIcon()}
            />
        </>
    );
};

export default React.memo(LinkAccountButton);
