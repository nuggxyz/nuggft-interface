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
    return (
        <div
            style={{
                padding: '1rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
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
                        color: Colors.nuggBlueText,
                        marginRight: '1rem',
                    }}>
                    Connect to Nugg.xyz!
                </Text>
                <NLStaticImage image="nugg" />
            </div>
            <div
                style={{
                    background: Colors.transparentWhite,
                    borderRadius: Layout.borderRadius.mediumish,
                    margin: '1.5rem',
                    padding: '1rem',
                }}>
                <Text type="text" size="smaller">
                    By connecting a wallet, you agree to Nugg.xyz's Terms of
                    Service and acknowledge that you have read and understood
                    the Nugg.xyz Protocol Disclaimer.
                </Text>
            </div>
            {Object.values(Web3Config.SUPPORTED_WALLETS).map((walletObject) =>
                walletObject.name !== 'MetaMask' ||
                (walletObject.name === 'MetaMask' && window.ethereum) ? (
                    <Button
                        buttonStyle={{
                            color: 'white',
                            borderRadius: Layout.borderRadius.large,
                            padding: '1rem',
                            width: '50%',
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
                            Web3State.safeActivate(walletObject.connector)
                        }
                    />
                ) : null,
            )}
        </div>
    );
};

export default ConnectWalletTab;
