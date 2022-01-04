import React from 'react';

import Web3State from '../../../state/web3';
import Jazzicon from '../Jazzicon';
import Text from '../../general/Texts/Text/Text';

import styles from './AccountViewer.styles';

const AccountViewer = () => {
    const address = Web3State.select.web3address();
    const ens = Web3State.hook.useEns(address);

    return ens ? (
        <div style={styles.textContainer}>
            <Text type="text" textStyle={styles.button}>
                {ens.toLowerCase()}
            </Text>
            <Jazzicon address={address} />
        </div>
    ) : null;
};

export default React.memo(AccountViewer);
