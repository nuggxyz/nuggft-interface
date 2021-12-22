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

import styles from './SwapPage.styles';

type Props = {};

const SwapPage: FunctionComponent<Props> = () => {
    const valuePerShare = ProtocolState.select.nuggftStakedEthPerShare();

    return (
        <div style={styles.container}>
            <div style={styles.secondaryContainer}>
                <div
                    style={{
                        // zIndex: 1000,
                        display: 'flex',
                        // background: 'white',
                        borderRadius: Layout.borderRadius.large,
                        padding: '.4rem .7rem',
                        alignItems: 'center',
                        marginBottom: '1rem',
                    }}>
                    <Text
                        type="text"
                        size="small"
                        weight="bolder"
                        textStyle={{
                            paddingRight: '.6rem',
                            color: Colors.nuggBlueText,
                            font: Layout.font.inter.bold,
                        }}>
                        FLOOR
                    </Text>
                    <CurrencyText
                        image="eth"
                        value={new EthInt(valuePerShare).decimal.toNumber()}
                    />
                </div>
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
