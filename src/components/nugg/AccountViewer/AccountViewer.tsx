import React from 'react';

import Jazzicon from '@src/components/nugg/Jazzicon';
import Text from '@src/components/general/Texts/Text/Text';
import AppState from '@src/state/app';
import Colors from '@src/lib/colors';
import InteractiveText from '@src/components/general/Texts/InteractiveText/InteractiveText';
import web3 from '@src/web3';
import state from '@src/state';
import NLStaticImage from '@src/components/general/NLStaticImage';
import { SupportedChainId } from '@src/web3/config';

import styles from './AccountViewer.styles';

const AccountViewer = () => {
    const screenType = AppState.select.screenType();
    const chainId = web3.hook.usePriorityChainId() as SupportedChainId;
    const provider = web3.hook.usePriorityProvider();
    const ens = web3.hook.usePriorityENSName(provider);
    const address = web3.hook.usePriorityAccount();
    const connector = web3.hook.usePriorityConnector();
    const balance = web3.hook.usePriorityBalance(provider);

    return ens && address ? (
        <div style={styles.textContainer}>
            <div
                style={{
                    marginRight: screenType === 'phone' ? '0rem' : '.5rem',
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'start',
                        justifyContent: 'flex-end',
                    }}
                >
                    <InteractiveText
                        color={Colors.nuggBlueText}
                        action={() => {
                            state.app.dispatch.toggleWalletManager();
                        }}
                        size={screenType === 'phone' ? 'small' : 'medium'}
                        type="text"
                        hideBorder={screenType === 'phone'}
                        textStyle={{
                            ...styles.button,
                            textAlign: 'right',
                            ...(screenType === 'phone'
                                ? {
                                      color: Colors.nuggRedText,
                                      marginRight: '.4rem',
                                  }
                                : { color: Colors.nuggBlueText }),
                        }}
                    >
                        {ens.toLowerCase()}
                    </InteractiveText>

                    <NLStaticImage
                        image={`${connector.info.label}_icon_small`}
                        style={{ marginLeft: '10px' }}
                    />
                    {screenType === 'phone' && <Jazzicon address={address} size={15} />}
                </div>
                <Text size="smaller" type="code" textStyle={styles.button}>
                    ( {web3.config.CHAIN_INFO[chainId].label} )
                    {balance ? balance.decimal.toNumber() : 0} ETH
                </Text>
            </div>
            {screenType !== 'phone' && <Jazzicon address={address} size={35} />}
        </div>
    ) : null;
};

export default React.memo(AccountViewer);
