import React, { FunctionComponent, useEffect, useState } from 'react';

import AppState from '../../../../state/app';
import { isUndefinedOrNullOrStringEmpty } from '../../../../lib';
import ProtocolState from '../../../../state/protocol';
import TransactionState from '../../../../state/transaction';
import TokenViewer from '../../TokenViewer';
import Text from '../../../general/Texts/Text/Text';
import WalletState from '../../../../state/wallet';
import { fromEth } from '../../../../lib/conversion';
import FontSize from '../../../../lib/fontSize';
import AnimatedCard from '../../../general/Cards/AnimatedCard/AnimatedCard';
import Colors from '../../../../lib/colors';
import FeedbackButton from '../../../general/Buttons/FeedbackButton/FeedbackButton';
import config from '../../../../state/web32/config';

import styles from './LoanOrBurn.styles';

type Props = {};

const LoanOrBurnModal: FunctionComponent<Props> = () => {
    const shareValue = ProtocolState.select.nuggftStakedEthPerShare();
    const toggle = TransactionState.select.toggleCompletedTxn();
    const { targetId, type } = AppState.select.modalData();
    const chainId = config.priority.usePriorityChainId();
    const provider = config.priority.usePriorityProvider();

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

    return (
        <div style={styles.container}>
            <Text textStyle={styles.textWhite}>
                {stableType === 'Loan' ? 'Loan' : 'Burn'} Nugg #{stableId}
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
                <FeedbackButton
                    overrideFeedback
                    feedbackText="Check Wallet..."
                    buttonStyle={styles.button}
                    label={`${stableType === 'Loan' ? 'Loan' : 'Burn'}`}
                    onClick={() =>
                        stableType === 'Loan'
                            ? WalletState.dispatch.initLoan({
                                  tokenId: stableId,
                                  chainId,
                                  provider,
                              })
                            : WalletState.dispatch.withdraw({
                                  tokenId: stableId,
                                  chainId,
                                  provider,
                              })
                    }
                />
            </div>
        </div>
    );
};

export default LoanOrBurnModal;
