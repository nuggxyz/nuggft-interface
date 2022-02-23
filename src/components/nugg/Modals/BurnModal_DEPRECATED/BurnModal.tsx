import React, { Fragment, FunctionComponent, useEffect, useState } from 'react';

import { Address } from '../../../../classes/Address';
import NuggftV1Helper from '../../../../contracts/NuggftV1Helper';
import { isUndefinedOrNullOrStringEmpty } from '../../../../lib';
import { fromEth } from '../../../../lib/conversion';
import NuggDexState from '../../../../state/nuggdex';
import ProtocolState from '../../../../state/protocol';
import TransactionState from '../../../../state/transaction';
import WalletState from '../../../../state/wallet';
import Web3Config from '../../../../state/web3/Web3Config';
import Button from '../../../general/Buttons/Button/Button';
import Text from '../../../general/Texts/Text/Text';
import TokenViewer from '../../TokenViewer';

import styles from './BurnModal.styles';

type Props = {};

const BurnModal: FunctionComponent<Props> = () => {
    const shareValue = ProtocolState.select.nuggftStakedEthPerShare();
    const toggle = TransactionState.select.toggleCompletedTxn();
    const myNuggs = NuggDexState.select.myNuggs();

    const [selected, setSelected] = useState('');

    return (
        <div style={styles.container}>
            <Text textStyle={styles.textWhite}>
                Select a NuggFT to withdraw
            </Text>
            <div style={styles.nuggCarousel}>
                {myNuggs.map((nugg) => (
                    <Fragment key={nugg}>
                        <Button
                            buttonStyle={{
                                ...styles.toggle,
                                ...(selected === nugg && styles.selected),
                            }}
                            rightIcon={
                                <TokenViewer
                                    tokenId={nugg}
                                    showLabel
                                    style={styles.nugg}
                                    labelColor="white"
                                />
                            }
                            onClick={() =>
                                setSelected(nugg === selected ? '' : nugg)
                            }
                        />
                    </Fragment>
                ))}
            </div>
            <div style={{ width: '100%' }}>
                <Text type="text" size="smaller" textStyle={styles.text}>
                    You will recieve {(+fromEth(shareValue)).toFixed(4)} ETH
                </Text>
                <Button
                    buttonStyle={styles.button}
                    label={
                        !isUndefinedOrNullOrStringEmpty(selected)
                            ? `Withdraw NuggFT #${selected}`
                            : 'Withdraw'
                    }
                    disabled={isUndefinedOrNullOrStringEmpty(selected)}
                    onClick={() =>
                        WalletState.dispatch.withdraw({
                            tokenId: selected,
                        })
                    }
                />
            </div>
        </div>
    );
};

export default BurnModal;
