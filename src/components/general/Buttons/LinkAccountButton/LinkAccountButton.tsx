import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Button from '../Button/Button';
import {
    isUndefinedOrNullOrObjectEmpty,
    shortenAddress,
} from '../../../../lib';
import Web3State from '../../../../state/web3';
import Web3Config from '../../../../state/web3/Web3Config';
import Loader from '../../Loader/Loader';
import Colors from '../../../../lib/colors';
import NLStaticImage from '../../NLStaticImage';
import NuggFTHelper from '../../../../contracts/NuggFTHelper';
import { EthInt } from '../../../../classes/Fraction';
import ProtocolState from '../../../../state/protocol';
import CurrencyText from '../../Texts/CurrencyText/CurrencyText';
import AppState from '../../../../state/app';
import Jazzicon from '../../../nugg/Jazzicon';

import styles from './LinkAccountButton.styles';

const LinkAccountButton = () => {
    const address = Web3State.select.web3address();
    const status = Web3State.select.web3status();
    const block = ProtocolState.select.currentBlock();
    const ens = Web3State.hook.useEns(address);

    const buttonLabel = useMemo(() => {
        if (status === 'SELECTED') {
            return !isUndefinedOrNullOrObjectEmpty(ens)
                ? ens.short
                : shortenAddress(address).toLowerCase();
        } else if (status === 'ERROR') {
            return 'Error';
        } else if (status === 'PENDING') {
            return 'Check your wallet';
        } else {
            return 'Connect';
        }
    }, [status, ens]);

    const buttonStyle = useMemo(() => {
        return {
            ...styles.button,
            ...(status === 'ERROR' ? styles.statusError : {}),
        };
    }, [status]);

    const onClick = useCallback(() => {
        // AppState.dispatch.setModalOpen({ name: 'Wallet' });
        if (status !== 'SELECTED') {
            Web3State.safeActivate(Web3Config.connectors.walletconnect);
        }
        // if (status === 'SELECTED') {
        //     Web3State.deactivate();
        //     Web3State.dispatch.clearWeb3Address();
        // }
    }, []);

    const getRightIcon = useCallback(
        () => (
            <div style={styles.iconWrapper}>
                {
                    status === 'PENDING' ? (
                        <Loader color={Colors.nuggBlueText} />
                    ) : status === 'SELECTED' ? (
                        <Jazzicon address={address} />
                    ) : status === 'NOT_SELECTED' ? (
                        <NLStaticImage image="nugg" />
                    ) : null //
                }
            </div>
        ),
        [status, address],
    );

    const [balance, setBalance] = useState(0);

    const getEthBalance = useCallback(async () => {
        setBalance(
            new EthInt(
                await NuggFTHelper.ethBalance(Web3State.getLibraryOrProvider()),
            ).decimal.toNumber(),
        );
    }, [address]);

    useEffect(() => {
        getEthBalance();
    }, [block]);

    return (
        <>
            {address && <CurrencyText image="eth" value={balance} />}
            {/* <>
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
            </> */}
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
