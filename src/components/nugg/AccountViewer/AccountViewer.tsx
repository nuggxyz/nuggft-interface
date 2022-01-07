import React from 'react';

import Web3State from '../../../state/web3';
import Jazzicon from '../Jazzicon';
import Text from '../../general/Texts/Text/Text';
import AppState from '../../../state/app';

import styles from './AccountViewer.styles';

const AccountViewer = () => {
    const screenType = AppState.select.screenType();
    const address = Web3State.select.web3address();
    const ens = Web3State.hook.useEns(address);

    return ens ? (
        <div style={styles.textContainer}>
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
