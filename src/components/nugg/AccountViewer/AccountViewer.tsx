import React, { useMemo } from 'react';

import Web3State from '../../../state/web3';
import Jazzicon from '../Jazzicon';
import Text from '../../general/Texts/Text/Text';
import AppState from '../../../state/app';
import Web3Config from '../../../state/web3/Web3Config';
import Colors from '../../../lib/colors';
import Layout from '../../../lib/layout';
import useAsyncState from '../../../hooks/useAsyncState';
import NuggftV1Helper from '../../../contracts/NuggftV1Helper';
import { fromEth } from '../../../lib/conversion';
import { EthInt } from '../../../classes/Fraction';
import InteractiveText from '../../general/Texts/InteractiveText/InteractiveText';

import styles from './AccountViewer.styles';

const AccountViewer = () => {
    const screenType = AppState.select.screenType();
    const address = Web3State.select.web3address();
    const ens = Web3State.hook.useEns(address);
    const chain = Web3State.select.currentChain();
    const web3address = Web3State.select.web3address();

    const name = useMemo(() => {
        return Web3Config.CHAIN_INFO[chain].label;
    }, [chain]);

    const userBalance = useAsyncState(
        () => NuggftV1Helper.ethBalance(Web3State.getLibraryOrProvider()),
        [address],
    );

    return ens ? (
        <div style={styles.textContainer}>
            <div
                style={{
                    marginRight: screenType === 'phone' ? '0rem' : '.5rem',
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <InteractiveText
                        color={Colors.nuggBlueText}
                        action={() => {
                            let win = window.open(
                                `${Web3Config.CHAIN_INFO[chain].explorer}address/${web3address}`,
                                '_blank',
                            );
                            win.focus();
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
                        }}>
                        {ens.toLowerCase()}
                    </InteractiveText>
                    {screenType === 'phone' && (
                        <Jazzicon address={address} size={15} />
                    )}
                </div>
                <Text size="smaller" type="text" textStyle={styles.button}>
                    {chain !== 1 && `(${name}) `}
                    {userBalance
                        ? new EthInt(
                              userBalance
                                  .div(10 ** 13)
                                  .add(1)
                                  .mul(10 ** 13),
                          ).decimal.toNumber()
                        : 0}{' '}
                    ETH
                </Text>
            </div>
            {screenType !== 'phone' && <Jazzicon address={address} size={35} />}
        </div>
    ) : null;
};

export default React.memo(AccountViewer);
