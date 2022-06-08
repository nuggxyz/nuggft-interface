import React, { useState } from 'react';
import { t } from '@lingui/macro';

import { isUndefinedOrNullOrStringEmptyOrZeroOrStringZero } from '@src/lib';
import { toEth } from '@src/lib/conversion';
import CurrencyInput from '@src/components/general/TextInputs/CurrencyInput/CurrencyInput';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import web3 from '@src/web3';
import Button from '@src/components/general/Buttons/Button/Button';
import client from '@src/client';
import { SellModalData } from '@src/interfaces/modals';
import {
    useNuggftV1,
    usePrioritySendTransaction,
    useTransactionManager2,
} from '@src/contracts/useContract';

import styles from './SellNuggOrItemModal.styles';

const SellNuggOrItemModal = ({ data }: { data: SellModalData }) => {
    const [amount, setAmount] = useState('');
    const address = web3.hook.usePriorityAccount();
    const stake = client.stake.useEps();
    const nuggft = useNuggftV1();

    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();
    const closeModal = client.modal.useCloseModal();

    const { send, hash } = usePrioritySendTransaction();

    useTransactionManager2(provider, hash, closeModal);
    return data.tokenId && chainId && provider && address ? (
        <div style={styles.container}>
            <Text textStyle={{ color: 'white' }}>
                {`${
                    data.tokenId.isNuggId() ? t`Sell` : t`Sell Item:`
                } ${data.tokenId.toPrettyId()}`}
            </Text>
            <AnimatedCard>
                <TokenViewer tokenId={data.tokenId} showcase />
            </AnimatedCard>
            <div style={styles.inputContainer}>
                {stake ? (
                    <CurrencyInput
                        // warning={swapError && 'Invalid input'}
                        shouldFocus
                        style={styles.input}
                        styleHeading={styles.heading}
                        styleInputContainer={styles.inputCurrency}
                        label={t`Enter floor`}
                        setValue={setAmount}
                        value={amount}
                        code
                        className="placeholder-white"
                        rightToggles={[
                            data.tokenId.isNuggId() ? (
                                <Button
                                    onClick={() => setAmount(stake.decimal.toPrecision(5))}
                                    label={t`Min`}
                                    size="small"
                                    buttonStyle={styles.minButton}
                                />
                            ) : (
                                <Text type="code">ETH</Text>
                            ),
                        ]}
                    />
                ) : null}
            </div>
            <div style={styles.break} />
            <div style={styles.subContainer}>
                <FeedbackButton
                    overrideFeedback
                    disabled={isUndefinedOrNullOrStringEmptyOrZeroOrStringZero(amount)}
                    feedbackText={t`Check Wallet...`}
                    buttonStyle={styles.button}
                    label={`${data.tokenId.isNuggId() ? t`Sell Nugg` : t`Sell Item`}`}
                    onClick={() => {
                        void (data.isItem()
                            ? send(
                                  nuggft.populateTransaction['sell(uint24,uint16,uint96)'](
                                      data.sellingNuggId.toRawId(),
                                      data.tokenId.toRawId(),
                                      toEth(amount),
                                  ),
                              )
                            : send(
                                  nuggft.populateTransaction['sell(uint24,uint96)'](
                                      data.tokenId.toRawId(),
                                      toEth(amount),
                                  ),
                              ));
                    }}
                />
            </div>
        </div>
    ) : null;
};

export default SellNuggOrItemModal;
