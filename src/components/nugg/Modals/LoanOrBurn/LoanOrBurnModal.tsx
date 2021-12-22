import React, { FunctionComponent, useEffect, useState } from 'react';

import AppState from '../../../../state/app';
import { isUndefinedOrNullOrStringEmpty } from '../../../../lib';
import NuggFTHelper from '../../../../contracts/NuggFTHelper';
import ProtocolState from '../../../../state/protocol';
import TransactionState from '../../../../state/transaction';
import TokenViewer from '../../TokenViewer';
import Button from '../../../general/Buttons/Button/Button';
import Text from '../../../general/Texts/Text/Text';
import WalletState from '../../../../state/wallet';
import TokenState from '../../../../state/token';
import { fromEth } from '../../../../lib/conversion';

import styles from './LoanOrBurn.styles';

type Props = {};

const LoanOrBurnModal: FunctionComponent<Props> = () => {
    const shareValue = ProtocolState.select.nuggftStakedEthPerShare();
    const toggle = TransactionState.select.toggleCompletedTxn();
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

    console.log(stableId);
    return (
        <div style={styles.container}>
            <Text textStyle={styles.textWhite}>
                {stableType === 'Loan' ? 'Loan' : 'Burn'} your Nugg
            </Text>
            <TokenViewer tokenId={stableId} />

            <div style={{ width: '100%' }}>
                <Text type="text" size="smaller" textStyle={styles.text}>
                    You will receive {(+fromEth(shareValue)).toFixed(4)} ETH
                </Text>
                <Button
                    buttonStyle={styles.button}
                    label={
                        isApproved
                            ? `${
                                  stableType === 'Loan' ? 'Loan' : 'Burn'
                              } Nugg #${stableId}`
                            : `Approve Nugg #${stableId}`
                    }
                    onClick={() =>
                        isApproved
                            ? stableType === 'Loan'
                                ? TokenState.dispatch.initSale({
                                      tokenId: stableId,
                                  })
                                : WalletState.dispatch.withdraw({
                                      tokenId: stableId,
                                  })
                            : WalletState.dispatch.approveNugg({
                                  tokenId: stableId,
                              })
                    }
                />
            </div>
        </div>
    );
};

export default LoanOrBurnModal;
