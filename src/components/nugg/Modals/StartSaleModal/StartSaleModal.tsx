import React, { FunctionComponent, useEffect, useState } from 'react';

import AppState from '../../../../state/app';
import { isUndefinedOrNullOrStringEmpty } from '../../../../lib';
import NuggFTHelper from '../../../../contracts/NuggFTHelper';
import ProtocolState from '../../../../state/protocol';
import TokenViewer from '../../TokenViewer';
import Button from '../../../general/Buttons/Button/Button';
import Text from '../../../general/Texts/Text/Text';
import TokenState from '../../../../state/token';
import { fromEth } from '../../../../lib/conversion';
import WalletDispatches from '../../../../state/wallet/dispatches';
import TransactionsSelectors from '../../../../state/transaction/selectors';

import styles from './StartSaleModal.styles';

type Props = {};

const SwapModal: FunctionComponent<Props> = () => {
    const shareValue = ProtocolState.select.nuggftStakedEthPerShare();
    const toggle = TransactionsSelectors.toggleCompletedTxn();
    const { targetId, type } = AppState.select.modalData();

    const [stableType, setType] = useState(type);
    const [stableId, setId] = useState(targetId);
    useEffect(() => {
        if (!isUndefinedOrNullOrStringEmpty(type)) {
            setType(type);
        }
        if (!isUndefinedOrNullOrStringEmpty(targetId)) {
            setId(targetId);
        }
    }, [type, targetId]);

    const [isApproved, setIsApproved] = useState(false);

    useEffect(() => {
        if (!isUndefinedOrNullOrStringEmpty(targetId) && !isApproved) {
            NuggFTHelper.sellerApproval(targetId).then((res) =>
                setIsApproved(res),
            );
        }
    }, [targetId, toggle, isApproved]);

    return (
        <div style={styles.container}>
            <Text textStyle={styles.textWhite}>
                {stableType === 'StartSale' ? 'Sell' : 'Withdraw'} your NuggFT
            </Text>
            <TokenViewer tokenId={stableId} />

            <div style={{ width: '100%' }}>
                <Text type="text" size="smaller" textStyle={styles.text}>
                    {stableType === 'StartSale'
                        ? 'The starting price will be '
                        : 'You will receieve '}
                    {(+fromEth(shareValue)).toFixed(4)} ETH
                </Text>
                <Button
                    buttonStyle={styles.button}
                    label={
                        isApproved
                            ? `${
                                  stableType === 'StartSale'
                                      ? 'Sell'
                                      : 'Withdraw'
                              } NuggFT #${stableId}`
                            : `Approve NuggFT #${stableId}`
                    }
                    onClick={() =>
                        isApproved
                            ? stableType === 'StartSale'
                                ? TokenState.dispatch.initSale({
                                      tokenId: stableId,
                                  })
                                : WalletDispatches.withdraw({
                                      tokenId: stableId,
                                  })
                            : WalletDispatches.approveNugg({
                                  tokenId: stableId,
                              })
                    }
                />
            </div>
        </div>
    );
};

export default SwapModal;
