import React, { useState } from 'react';
import { t } from '@lingui/macro';

import {
    extractItemId,
    isUndefinedOrNullOrStringEmptyOrZeroOrStringZero,
    parseTokenId,
} from '@src/lib';
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
import { useNuggftV1, useTransactionManager } from '@src/contracts/useContract';

import styles from './SellNuggOrItemModal.styles';

const SellNuggOrItemModal = ({ data: { tokenId, ...other } }: { data: SellModalData }) => {
    const [amount, setAmount] = useState('');
    const address = web3.hook.usePriorityAccount();
    const stake = client.static.stake();
    const nuggft = useNuggftV1();

    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();
    const closeModal = client.modal.useCloseModal();

    const { send } = useTransactionManager();

    return tokenId && chainId && provider && address ? (
        <div style={styles.container}>
            <Text textStyle={{ color: 'white' }}>
                {`${other.tokenType === 'nugg' ? t`Sell` : t`Sell Item:`} ${parseTokenId(
                    tokenId,
                    true,
                )}`}
            </Text>
            <AnimatedCard>
                <TokenViewer tokenId={tokenId} showcase />
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
                            other.tokenType === 'nugg' ? (
                                <Button
                                    onClick={() => setAmount(stake.eps.decimal.toPrecision(5))}
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
                    label={`${other.tokenType === 'nugg' ? t`Sell Nugg` : t`Sell Item`}`}
                    onClick={() => {
                        void (other.tokenType === ('item' as const)
                            ? send(
                                  nuggft.populateTransaction['sell(uint24,uint16,uint96)'](
                                      other.sellingNuggId,
                                      extractItemId(tokenId),
                                      toEth(amount),
                                  ),
                                  closeModal,
                              )
                            : send(
                                  nuggft.populateTransaction['sell(uint24,uint96)'](
                                      tokenId,
                                      toEth(amount),
                                  ),
                                  closeModal,
                              ));
                    }}
                />
            </div>
        </div>
    ) : null;
};

export default SellNuggOrItemModal;