import React, { FunctionComponent } from 'react';

import { EthInt } from '../../../../../classes/Fraction';
import NuggFTHelper from '../../../../../contracts/NuggFTHelper';
import useAsyncState from '../../../../../hooks/useAsyncState';
import AppState from '../../../../../state/app';
import ProtocolState from '../../../../../state/protocol';
import TransactionState from '../../../../../state/transaction';
import WalletState from '../../../../../state/wallet';
import Button from '../../../../general/Buttons/Button/Button';
import NumberStatistic from '../../../Statistics/NumberStatistic';
import TextStatistic from '../../../Statistics/TextStatistic';
import styles from '../SwapTab_DEPRECATED/SwapTab.styles';

type Props = {};

const MintTab: FunctionComponent<Props> = () => {
    const userShares = WalletState.select.userShares();
    const valuePerShare = ProtocolState.select.nuggftStakedEthPerShare();

    return (
        <div>
            <div style={styles.statisticContainer}>
                <TextStatistic
                    label="Nuggs"
                    value={'' + userShares}
                    // style={{ background: Colors.gradient3 }}
                    // labelColor="white"
                />
                <NumberStatistic
                    label="TVL"
                    value={new EthInt(`${+valuePerShare * userShares}`)}
                    image="eth"
                    // style={{ background: Colors.gradient3 }}
                    // labelColor="white"
                />
            </div>
            <Button
                buttonStyle={styles.button}
                textStyle={styles.whiteText}
                label="Mint a nugg"
                onClick={() =>
                    NuggFTHelper.instance.minSharePrice().then((minPrice) =>
                        NuggFTHelper.instance
                            .mint(700, {
                                value: minPrice,
                            })
                            .then((_pendingtx) =>
                                TransactionState.dispatch.initiate({
                                    _pendingtx,
                                }),
                            ),
                    )
                }
            />
        </div>
    );
};

export default MintTab;
