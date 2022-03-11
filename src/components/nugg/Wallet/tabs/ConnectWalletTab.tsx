import React, { FunctionComponent } from 'react';
import curriedLighten from 'polished/lib/color/lighten';

import Colors from '@src/lib/colors';
import Layout from '@src/lib/layout';
import Button from '@src/components/general/Buttons/Button/Button';
import NLStaticImage from '@src/components/general/NLStaticImage';
import Text from '@src/components/general/Texts/Text/Text';
import web3 from '@src/web3';
import HappyTipper from '@src/components/general/HappyTipper/HappyTipper';
import lib from '@src/lib';

type Props = {};

const ConnectWalletTab: FunctionComponent<Props> = () => {
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
                    height: '100%',
                    alignItems: 'center',
                    width: '100%',
                    overflow: 'scroll',
                }}
            >
                {Object.values(web3.config.peers).map(
                    (peer) =>
                        !peer.fallback && (
                            <Button
                                key={peer.name}
                                buttonStyle={{
                                    width: '225px',
                                    boxShadow: lib.layout.boxShadow.dark,
                                    color: 'white',
                                    border: `${curriedLighten(0.1)(peer.color)}`,
                                    borderWidth: '5px',
                                    borderStyle: 'solid',
                                    borderRadius: Layout.borderRadius.large,
                                    padding: '.5rem',
                                    pointerEvents: 'auto',
                                    background: `white`,
                                    margin: '.5rem',
                                }}
                                hoverStyle={
                                    {
                                        // background: curriedLighten(0.25)(peer.color),
                                        // filter: undefined,
                                    }
                                }
                                rightIcon={<NLStaticImage image={peer.peer} />}
                                onClick={async () => {
                                    if (
                                        web3.config.connector_instances[peer.type].store.getState()
                                            .activating
                                    )
                                        await web3.config.connector_instances[
                                            peer.type
                                        ].connector.deactivate();
                                    web3.config.connector_instances[peer.type].connector.activate(
                                        undefined,
                                        peer.peer,
                                    );
                                }}
                            />
                        ),
                )}
                <HappyTipper tip="wallet-1" />
            </div>
        </div>
    );
};

export default ConnectWalletTab;
