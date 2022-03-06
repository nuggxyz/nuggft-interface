import React, { FunctionComponent, useEffect, useState } from 'react';

import AppState from '@src/state/app';
import { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import TransactionState from '@src/state/transaction';
import TokenViewer from '@src/components/nugg/TokenViewer';
import Text from '@src/components/general/Texts/Text/Text';
import WalletState from '@src/state/wallet';
import FontSize from '@src/lib/fontSize';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import Colors from '@src/lib/colors';
import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import web3 from '@src/web3';
import client from '@src/client';

import styles from './LoanOrBurn.styles';

type Props = {};

const LoanOrBurnModal: FunctionComponent<Props> = () => {
    const stake = client.live.stake();
    const toggle = TransactionState.select.toggleCompletedTxn();
    const { targetId, type } = AppState.select.modalData();
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();
    const address = web3.hook.usePriorityAccount();

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
                        }}
                    >
                        This cannot be undone
                    </Text>
                )}
                <Text type="text" textStyle={styles.text}>
                    You will receive {+stake?.eps.decimal.toFixed(4)} ETH
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
                                  address,
                              })
                            : WalletState.dispatch.withdraw({
                                  tokenId: stableId,
                                  chainId,
                                  provider,
                                  address,
                              })
                    }
                />
            </div>
        </div>
    );
};

export default LoanOrBurnModal;
