import React, { FunctionComponent } from 'react';

import AccountStats from '../../components/nugg/AccountStats/AccountStats';
import Text from '../../components/general/Texts/Text/Text';
import RingAbout from '../../components/nugg/RingAbout/RingAbout';
import TheRing from '../../components/nugg/TheRing/TheRing';
import Wallet from '../../components/nugg/Wallet/Wallet';
import Layout from '../../lib/layout';
import CurrencyText from '../../components/general/Texts/CurrencyText/CurrencyText';
import { EthInt } from '../../classes/Fraction';
import Colors from '../../lib/colors';
import ProtocolState from '../../state/protocol';
import AppState from '../../state/app';

import styles from './SwapPage.styles';

type Props = {};

const SwapPage: FunctionComponent<Props> = () => {
    const { width } = AppState.select.dimensions();
    console.log(width);
    return (
        <div style={styles.container}>
            <div style={styles.secondaryContainer}>
                <RingAbout />
            </div>
            <div style={styles.theRingContainer}>
                <TheRing />
            </div>
            <div style={styles.secondaryContainer}>
                <Wallet />
            </div>
        </div>
    );
};

export default SwapPage;
