import React, { useMemo } from 'react';
import { t } from '@lingui/macro';
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';

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
import lib, { isUndefinedOrNull } from '@src/lib';
import useAsyncState from '@src/hooks/useAsyncState';
import { EthInt } from '@src/classes/Fraction';
import Loader from '@src/components/general/Loader/Loader';

import styles from './LoanOrBurnModal.styles';

const LoanOrBurnModal = ({ data: { tokenId, actionType } }: { data: LoanModalData }) => {
    const stake__eps = client.stake.useEps();
    const chainId = web3.hook.usePriorityChainId();
    const network = web3.hook.useNetworkProvider();
    const address = web3.hook.usePriorityAccount();
    const nuggft = useNuggftV1(network);
    const myNuggs = client.user.useNuggs();
    const closeModal = client.modal.useCloseModal();
    const provider = web3.hook.usePriorityProvider();

    const [send, estimator, hash, , ,] = usePrioritySendTransaction();

    useTransactionManager2(provider, hash, closeModal);

    const needToClaim = React.useMemo(() => {
        const nugg = myNuggs.find((x) => x.tokenId === tokenId);

        return nugg && nugg.pendingClaim;
    }, [tokenId, myNuggs]);

    const populatedTransaction = useMemo(() => {
        const action = nuggft.populateTransaction.loan([tokenId.toRawId()]);
        if (needToClaim && address) {
            const claim = nuggft.populateTransaction.claim(
                [tokenId.toRawId()],
                [address],
                [0],
                [0],
            );
            const multi = async () => {
                return nuggft.populateTransaction.multicall([
                    (await claim).data || '0x0',
                    (await action).data || '0x0',
                ]);
            };
            return multi();
        }
        return action;
    }, [nuggft, tokenId, address, actionType, needToClaim]);
    const estimation = useAsyncState(() => {
        if (!isUndefinedOrNull(populatedTransaction) && network) {
            return Promise.all([
                estimator.estimate(populatedTransaction),
                network?.getGasPrice(),
            ]).then((_data) => ({
                gasLimit: _data[0] || BigNumber.from(0),
                gasPrice: new EthInt(_data[1] || 0),
                mul: new EthInt((_data[0] || BigNumber.from(0)).mul(_data[1] || 0)),
                // amount: populatedTransaction.amount,
            }));
        }

        return undefined;
    }, [populatedTransaction, network]);

    const calculating = React.useMemo(() => {
        if (estimator.error) return false;
        if (!isUndefinedOrNull(populatedTransaction) && estimation) {
            return false;
        }
        return true;
    }, [populatedTransaction, estimation, estimator]);

    return tokenId && chainId && provider && address ? (
        <div style={styles.container}>
            <Text textStyle={styles.title}>
                {actionType === 'loan' ? t`Loan` : t`Burn`} {t`${tokenId.toPrettyId()}`}
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
                    rightIcon={
                        calculating
                            ? ((
                                  <div style={{ position: 'absolute', right: '.7rem' }}>
                                      <Loader color="white" />
                                  </div>
                              ) as JSX.Element)
                            : undefined
                    }
                    onClick={() => {
                        if (!isUndefinedOrNull(populatedTransaction)) {
                            void send(populatedTransaction);
                        }
                    }}
                />
            </div>
        </div>
    ) : null;
};

export default LoanOrBurnModal;
