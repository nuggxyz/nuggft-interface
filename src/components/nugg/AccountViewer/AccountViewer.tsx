import React, { useMemo } from 'react';

import Jazzicon from '../Jazzicon';
import Text from '../../general/Texts/Text/Text';
import AppState from '../../../state/app';
import Colors from '../../../lib/colors';
import useAsyncState from '../../../hooks/useAsyncState';
import { EthInt } from '../../../classes/Fraction';
import InteractiveText from '../../general/Texts/InteractiveText/InteractiveText';
import config from '../../../state/web32/config';

import styles from './AccountViewer.styles';

const AccountViewer = () => {
    const screenType = AppState.select.screenType();
    const chainId = config.priority.usePriorityChainId();

    const name = useMemo(() => {
        console.log({ chainId });
        return chainId && chainId !== -1 ? config.CHAIN_INFO[chainId].label : 'uk';
    }, [chainId]);

    const provider = config.priority.usePriorityProvider();
    const ens = config.priority.usePriorityENSName(provider);
    const address = config.priority.usePriorityAccount();
    const connector = config.priority.usePriorityConnector();

    const userBalance = useAsyncState(
        () => provider && address && provider.getBalance(address),
        [address, provider, chainId],
    );

    return ens && address ? (
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
                            // let win = window.open(
                            //     `${config.CHAIN_INFO[chainId].explorer}address/${address}`,
                            //     '_blank',
                            // );
                            // win.focus();
                            connector.deactivate();
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
                    {screenType === 'phone' && <Jazzicon address={address} size={15} />}
                </div>
                <Text size="smaller" type="code" textStyle={styles.button}>
                    {chainId !== 1 && `(${name}) `}
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
