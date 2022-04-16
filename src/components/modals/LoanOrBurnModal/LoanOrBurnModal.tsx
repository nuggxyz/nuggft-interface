import React from 'react';
import { t } from '@lingui/macro';

import TokenViewer from '@src/components/nugg/TokenViewer';
import Text from '@src/components/general/Texts/Text/Text';
import FontSize from '@src/lib/fontSize';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import Colors from '@src/lib/colors';
import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import web3 from '@src/web3';
import client from '@src/client';
import { LoanModalData } from '@src/interfaces/modals';
import { useNuggftV1, useTransactionManager } from '@src/contracts/useContract';

import styles from './LoanOrBurnModal.styles';

const LoanOrBurnModal = ({ data: { tokenId, actionType } }: { data: LoanModalData }) => {
    const stake__eps = client.live.stake.eps();
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();
    const address = web3.hook.usePriorityAccount();
    const nuggft = useNuggftV1(provider);
    const closeModal = client.modal.useCloseModal();

    const { send } = useTransactionManager();

    return tokenId && chainId && provider && address ? (
        <div style={styles.container}>
            <Text textStyle={styles.textWhite}>
                {actionType === 'loan' ? t`Loan` : t`Burn`} {t`Nugg ${tokenId}`}
            </Text>
            <AnimatedCard>
                <TokenViewer tokenId={tokenId} />
            </AnimatedCard>

            <div style={{ width: '100%' }}>
                {actionType === 'burn' && (
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
                        {t`This cannot be undone`}
                    </Text>
                )}

                <Text type="text" textStyle={styles.text}>
                    {stake__eps ? t`You will receive ${+stake__eps.decimal.toFixed(4)} ETH` : null}
                </Text>

                <FeedbackButton
                    overrideFeedback
                    feedbackText={t`Check wallet...`}
                    buttonStyle={styles.button}
                    label={`${actionType === 'loan' ? t`Loan` : t`Burn`}`}
                    onClick={() =>
                        actionType === 'loan'
                            ? send(nuggft.populateTransaction.loan([tokenId]), closeModal)
                            : send(nuggft.populateTransaction.burn(tokenId), closeModal)
                    }
                />
            </div>
        </div>
    ) : null;
};

export default LoanOrBurnModal;