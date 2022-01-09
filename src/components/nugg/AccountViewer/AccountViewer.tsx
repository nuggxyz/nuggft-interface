import React, { useMemo } from 'react';

import Web3State from '../../../state/web3';
import Jazzicon from '../Jazzicon';
import Text from '../../general/Texts/Text/Text';
import AppState from '../../../state/app';
import Web3Config from '../../../state/web3/Web3Config';
import Colors from '../../../lib/colors';
import Layout from '../../../lib/layout';

import styles from './AccountViewer.styles';

const AccountViewer = () => {
    const screenType = AppState.select.screenType();
    const address = Web3State.select.web3address();
    const ens = Web3State.hook.useEns(address);
    const chain = Web3State.select.currentChain();

    const name = useMemo(() => {
        return Web3Config.CHAIN_INFO[chain].label;
    }, [chain]);

    return ens ? (
        <div style={styles.textContainer}>
            <Text
                type="text"
                textStyle={{
                    padding: '.3rem .7rem',
                    background: Colors.transparentWhite,
                    marginRight: '1rem',
                    borderRadius: Layout.borderRadius.large,
                }}>
                {name}
            </Text>
            <Text
                type="text"
                textStyle={{
                    ...styles.button,
                    ...(screenType === 'phone' && { color: 'white' }),
                }}>
                {ens.toLowerCase()}
            </Text>
            <Jazzicon address={address} />
        </div>
    ) : null;
};

export default React.memo(AccountViewer);
