import React from 'react';
import { t } from '@lingui/macro';

import TokenViewer from '@src/components/nugg/TokenViewer';
import Text from '@src/components/general/Texts/Text/Text';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import web3 from '@src/web3';
import client from '@src/client';
import { LoanModalData } from '@src/interfaces/modals';
import {
    useNuggftV1,
    usePrioritySendTransaction,
    useTransactionManager2,
} from '@src/contracts/useContract';
import lib from '@src/lib';

import styles from './LoanOrBurnModal.styles';

const LoanOrBurnModal = ({ data: { tokenId, actionType } }: { data: LoanModalData }) => {
    const stake__eps = client.stake.useEps();
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();
    const address = web3.hook.usePriorityAccount();
    const nuggft = useNuggftV1(provider);
    const closeModal = client.modal.useCloseModal();

    const [send, , hash, , ,] = usePrioritySendTransaction();

    useTransactionManager2(provider, hash, closeModal);

    return tokenId && chainId && provider && address ? (
        <div style={styles.container}>
            <Text textStyle={styles.textWhite}>
                {actionType === 'loan' ? t`Loan` : t`Burn`} {t`Nugg ${tokenId.toRawId()}`}
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
                            color: lib.colors.nuggRedText,
                            fontSize: lib.fontSize.h5,
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
                    onClick={() => {
                        if (actionType === 'loan')
                            void send(nuggft.populateTransaction.loan([tokenId.toRawId()]));
                        // else void send(nuggft.populateTransaction.burn(tokenId.toRawId()));
                    }}
                />
            </div>
        </div>
    ) : null;
};

export default LoanOrBurnModal;
