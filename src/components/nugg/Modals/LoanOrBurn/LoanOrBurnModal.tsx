import React, { FunctionComponent, useEffect, useState } from 'react';

import AppState from '../../../../state/app';
import { isUndefinedOrNullOrStringEmpty } from '../../../../lib';
import NuggftV1Helper from '../../../../contracts/NuggftV1Helper';
import ProtocolState from '../../../../state/protocol';
import TransactionState from '../../../../state/transaction';
import TokenViewer from '../../TokenViewer';
import Button from '../../../general/Buttons/Button/Button';
import Text from '../../../general/Texts/Text/Text';
import WalletState from '../../../../state/wallet';
import TokenState from '../../../../state/token';
import { fromEth } from '../../../../lib/conversion';
import { Address } from '../../../../classes/Address';
import Web3Config from '../../../../state/web3/Web3Config';
import FontSize from '../../../../lib/fontSize';
import AnimatedCard from '../../../general/Cards/AnimatedCard/AnimatedCard';
import Colors from '../../../../lib/colors';

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
            NuggftV1Helper.sellerApproval(targetId).then((res) =>
                setIsApproved(res),
            );
        }
    }, [targetId, toggle, isApproved]);

    return (
        <div style={styles.container}>
            <Text textStyle={styles.textWhite}>
                {stableType === 'Loan' ? 'Loan' : 'Burn'} your Nugg
            </Text>
            <AnimatedCard>
                <TokenViewer tokenId={stableId} />
            </AnimatedCard>

            <div style={{ width: '100%' }}>
                {stableType === 'Burn' && (
                    <Text
                        type="text"
                        size="medium"
                        weight="bold"
                        textStyle={{
                            ...styles.text,
                            color: Colors.nuggRedText,
                            fontSize: FontSize.h5,
                        }}>
                        This cannot be undone
                    </Text>
                )}
                <Text type="text" textStyle={styles.text}>
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
                                ? WalletState.dispatch.initLoan({
                                      tokenId: stableId,
                                  })
                                : WalletState.dispatch.withdraw({
                                      tokenId: stableId,
                                  })
                            : WalletState.dispatch.approveNugg({
                                  spender: new Address(
                                      Web3Config.activeChain__NuggftV1,
                                  ),
                                  tokenId: stableId,
                              })
                    }
                />
            </div>
        </div>
    );
};

export default LoanOrBurnModal;
