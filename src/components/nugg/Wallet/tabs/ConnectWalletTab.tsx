import { useWeb3React } from '@web3-react/core';
import React, { FunctionComponent } from 'react';

import Colors from '../../../../lib/colors';
import Layout from '../../../../lib/layout';
import Web3State from '../../../../state/web3';
import Web3Config from '../../../../state/web3/Web3Config';
import Button from '../../../general/Buttons/Button/Button';
import NLStaticImage from '../../../general/NLStaticImage';
import Text from '../../../general/Texts/Text/Text';

type Props = {};

const ConnectWalletTab: FunctionComponent<Props> = () => {
    const { activate } = useWeb3React();
    return (
        <div
            style={{
                padding: '1rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                height: '100%',
            }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    justifyContent: 'space-between',
                }}>
                <Text
                    size="large"
                    textStyle={{
                        color: 'white',
                        marginRight: '1rem',
                    }}>
                    Connect to Nugg.xyz!
                </Text>
                <NLStaticImage image="nugg" />
            </div>
            <div
                style={{
                    background: Colors.transparentLightGrey,
                    borderRadius: Layout.borderRadius.smallish,
                    margin: '1.5rem',
                    padding: '1rem',
                }}>
                <Text
                    type="text"
                    size="smaller"
                    textStyle={{ color: Colors.textColor }}>
                    By connecting a wallet, you agree to nugg.xyz's Terms of
                    Service and acknowledge that you have read and understood
                    the nugg.xyz Protocol Disclaimer.
                </Text>
            </div>
            <div
                style={{
                    background: Colors.transparentWhite,
                    borderRadius: Layout.borderRadius.medium,
                    // margin: '1.5rem',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: '100%',
                }}>
                {Object.values(Web3Config.SUPPORTED_WALLETS).map(
                    (walletObject) =>
                        walletObject.name !== 'MetaMask' ||
                        (walletObject.name === 'MetaMask' &&
                            window.ethereum) ? (
                            <Button
                                key={walletObject.name}
                                buttonStyle={{
                                    color: 'white',
                                    borderRadius: Layout.borderRadius.large,
                                    padding: '1rem',
                                    pointerEvents: 'auto',
                                    background: `${walletObject.color}66`,
                                    margin: '1rem',
                                }}
                                rightIcon={
                                    <NLStaticImage
                                        //@ts-ignore
                                        image={walletObject.name}
                                    />
                                }
                                onClick={() =>
                                    Web3State.safeActivate(activate)(
                                        walletObject.connector,
                                    )
                                }
                            />
                        ) : null,
                )}
            </div>
        </div>
    );
};

export default ConnectWalletTab;
