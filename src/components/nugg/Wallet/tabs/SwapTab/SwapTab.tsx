import React, { FunctionComponent, useState } from 'react';

import { EthInt } from '../../../../../classes/Fraction';
import WalletState from '../../../../../state/wallet';
import NumberStatistic from '../../../Statistics/NumberStatistic';
import ProtocolState from '../../../../../state/protocol';
import TextStatistic from '../../../Statistics/TextStatistic';
import Colors from '../../../../../lib/colors';
import Button from '../../../../general/Buttons/Button/Button';
import AppState from '../../../../../state/app';

import styles from './SwapTab.styles';

type Props = { isActive?: boolean };

const SwapTab: FunctionComponent<Props> = ({ isActive }) => {
    const userShares = WalletState.select.userShares();

    const totalEth = ProtocolState.select.nuggftStakedEth();
    const totalShares = ProtocolState.select.nuggftStakedShares();
    const valuePerShare = ProtocolState.select.nuggftStakedEthPerShare();

    const [amount, setAmount] = useState();

    return (
        <div style={styles.container}>
            <div style={styles.selectContainer}>
                <div style={styles.statisticContainer}>
                    <NumberStatistic
                        label="Total value"
                        value={new EthInt(totalEth)}
                        image="eth"
                        style={{ alignItems: 'center' }}
                    />
                </div>
                <div style={styles.statisticContainer}>
                    <TextStatistic label="Total shares" value={totalShares} />
                    <NumberStatistic
                        label="Value per share"
                        value={new EthInt(valuePerShare)}
                        image="eth"
                    />
                </div>
            </div>
            <div style={styles.selectContainer}>
                <div style={styles.statisticContainer}>
                    <TextStatistic
                        label="Your shares"
                        value={'' + userShares}
                        style={{ background: Colors.gradient3 }}
                        labelColor="white"
                    />
                    <NumberStatistic
                        label="Your worth"
                        value={new EthInt(`${+valuePerShare * userShares}`)}
                        image="eth"
                        style={{ background: Colors.gradient3 }}
                        labelColor="white"
                    />
                </div>
                <div>
                    <Button
                        buttonStyle={styles.button}
                        textStyle={styles.whiteText}
                        label="Withdraw..."
                        onClick={() =>
                            AppState.dispatch.setModalOpen({
                                name: 'Burn',
                                modalData: {
                                    backgroundStyle: {
                                        background: Colors.gradient3,
                                    },
                                },
                            })
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default React.memo(SwapTab);
