import React, { FunctionComponent } from 'react';

import Colors from '@src/lib/colors';
import Layout from '@src/lib/layout';
import Button from '@src/components/general/Buttons/Button/Button';
import NLStaticImage from '@src/components/general/NLStaticImage';
import Text from '@src/components/general/Texts/Text/Text';
import web3 from '@src/web3';
import HappyTipper from '@src/components/general/HappyTipper/HappyTipper';
import state from '@src/state';
type Props = {};

const ConnectWalletTab: FunctionComponent<Props> = () => {
    const screenType = state.app.select.screenType();
    return (
        <div
            style={{
                padding: '.25rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                height: '100%',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    justifyContent: 'space-between',
                }}
            >
                <Text
                    size="large"
                    textStyle={{
                        color: 'white',
                        marginRight: '1rem',
                    }}
                >
                    Connect to nuggft!
                </Text>
                <NLStaticImage image="nugg" />
            </div>
            <div
                style={{
                    background: Colors.transparentLightGrey,
                    borderRadius: Layout.borderRadius.smallish,
                    margin: '1.5rem',
                    padding: '1rem',
                }}
            >
                <Text type="text" size="smaller" textStyle={{ color: Colors.textColor }}>
                    By connecting a wallet, you agree to nugg.xyz's Terms of Service and acknowledge
                    that you have read and understood the nugg.xyz Protocol Disclaimer.
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
                }}
            >
                {Object.values(web3.config.SUPPORTED_WALLETS).map((walletObject) => (
                    <Button
                        key={walletObject.name}
                        buttonStyle={{
                            color: 'white',
                            border: `${walletObject.color}`,
                            borderWidth: '5px',
                            borderStyle: 'solid',
                            borderRadius: Layout.borderRadius.large,
                            padding: '1rem',
                            pointerEvents: 'auto',
                            background: 'white',
                            margin: '1rem',
                        }}
                        rightIcon={
                            <NLStaticImage
                                //@ts-ignore
                                image={walletObject.name}
                            />
                        }
                        onClick={() => walletObject.connector.connector.activate()}
                    />
                ))}
                <HappyTipper tip="wallet-1" />
            </div>
        </div>
    );
};

export default ConnectWalletTab;
