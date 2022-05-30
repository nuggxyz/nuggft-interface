import React, { useState } from 'react';
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';
import { t } from '@lingui/macro';

import useAsyncState from '@src/hooks/useAsyncState';
import { fromEth, toEth } from '@src/lib/conversion';
import Button from '@src/components/general/Buttons/Button/Button';
import CurrencyInput from '@src/components/general/TextInputs/CurrencyInput/CurrencyInput';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import lib from '@src/lib';
import web3 from '@src/web3';
import { LoanInputModalData } from '@src/interfaces/modals';
import {
    useNuggftV1,
    usePrioritySendTransaction,
    useTransactionManager2,
} from '@src/contracts/useContract';
import client from '@src/client';

import styles from './LoanInputModal.styles';

const LoanInputModal = ({ data: { tokenId, actionType } }: { data: LoanInputModalData }) => {
    const [amount, setAmount] = useState('');
    const address = web3.hook.usePriorityAccount();

    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();

    const userBalance = web3.hook.usePriorityBalance(provider);
    const nuggft = useNuggftV1(provider);
    const closeModal = client.modal.useCloseModal();

    const { send, hash } = usePrioritySendTransaction();

    useTransactionManager2(provider, hash, closeModal);

    const amountFromChain = useAsyncState<BigNumber[]>(() => {
        if (tokenId && chainId && provider) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            if (actionType === 'liquidate') {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                return nuggft.vfl([tokenId.toRawId()]).then((v) => {
                    return v;
                });
            }
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            return nuggft.vfr([tokenId.toRawId()]).then((v) => {
                return v;
            });
        }
        // eslint-disable-next-line no-promise-executor-return
        return new Promise((resolve) => resolve([]));
    }, [address, tokenId, actionType, chainId, provider]);

    return (
        <div style={styles.container}>
            <Text textStyle={{ color: 'white' }}>{`${
                actionType === 'liquidate' ? t`Payoff` : t`Extend`
            } Nugg ${tokenId.toRawId()}`}</Text>
            <AnimatedCard>
                <TokenViewer tokenId={tokenId} labelColor="white" showcase />
            </AnimatedCard>
            <div style={styles.inputContainer}>
                <CurrencyInput
                    shouldFocus
                    style={styles.input}
                    styleHeading={styles.heading}
                    styleInputContainer={styles.inputCurrency}
                    label={t`Enter amount`}
                    setValue={setAmount}
                    value={amount}
                    code
                    className="placeholder-white"
                    rightToggles={[
                        <Button
                            onClick={() =>
                                amountFromChain &&
                                amountFromChain.length > 0 &&
                                setAmount(
                                    fromEth(
                                        amountFromChain[0]
                                            .div(10 ** 13)
                                            .add(1)
                                            .mul(10 ** 13),
                                    ),
                                )
                            }
                            label={t`Min`}
                            textStyle={{
                                ...lib.layout.presets.font.main.bold,
                                fontSize: lib.fontSize.h6,
                            }}
                            buttonStyle={{
                                borderRadius: lib.layout.borderRadius.large,
                                padding: '.2rem .5rem',
                            }}
                        />,
                    ]}
                />
            </div>
            <div
                style={{
                    width: '100%',
                    height: '1rem',
                    marginBottom: '.5rem',
                }}
            >
                {userBalance ? (
                    <Text type="text" size="small" textStyle={styles.text} weight="bolder">
                        {t`You currently have ${userBalance.num.toString()} ETH`}
                    </Text>
                ) : null}
            </div>
            <div style={styles.subContainer}>
                <FeedbackButton
                    feedbackText={t`Check Wallet`}
                    buttonStyle={styles.button}
                    label={`${actionType === 'liquidate' ? t`Payoff` : t`Extend`}`}
                    onClick={() => {
                        if (tokenId && chainId && provider && address)
                            if (actionType === 'liquidate')
                                void send(
                                    nuggft.populateTransaction.liquidate(tokenId.toRawId(), {
                                        value: toEth(amount),
                                    }),
                                );
                            else
                                void send(
                                    nuggft.populateTransaction.rebalance([tokenId.toRawId()], {
                                        value: toEth(amount),
                                    }),
                                );
                    }}
                />
            </div>
        </div>
    );
};

export default LoanInputModal;
