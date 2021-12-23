import React, { Fragment, FunctionComponent, useEffect, useState } from 'react';

import NuggFTHelper from '../../../../contracts/NuggFTHelper';
import { isUndefinedOrNullOrStringEmpty } from '../../../../lib';
import { fromEth } from '../../../../lib/conversion';
import NuggDexState from '../../../../state/nuggdex';
import ProtocolState from '../../../../state/protocol';
import TransactionState from '../../../../state/transaction';
import WalletState from '../../../../state/wallet';
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

    const [isApproved, setIsApproved] = useState(false);

    useEffect(() => {
        setIsApproved(false);
    }, [selected]);

    useEffect(() => {
        if (!isUndefinedOrNullOrStringEmpty(selected) && !isApproved) {
            NuggFTHelper.sellerApproval(selected).then((res) =>
                setIsApproved(res),
            );
        }
    }, [selected, toggle, isApproved]);

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
                            ? isApproved
                                ? `Withdraw NuggFT #${selected}`
                                : `Approve NuggFT #${selected}`
                            : 'Withdraw'
                    }
                    disabled={isUndefinedOrNullOrStringEmpty(selected)}
                    onClick={() =>
                        isApproved
                            ? WalletState.dispatch.withdraw({
                                  tokenId: selected,
                              })
                            : WalletState.dispatch.approveNugg({
                                  tokenId: selected,
                              })
                    }
                />
            </div>
        </div>
    );
};

export default BurnModal;