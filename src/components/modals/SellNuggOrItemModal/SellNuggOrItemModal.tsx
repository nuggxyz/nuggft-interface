import React, { useMemo, useState } from 'react';
import { t } from '@lingui/macro';
import { BigNumber } from 'ethers';

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
import { useUsdPair } from '@src/client/usd';
import { Address } from '@src/classes/Address';

import styles from './SellNuggOrItemModal.styles';

const SellNuggOrItemModal = ({ data }: { data: SellModalData }) => {
    const [amount, setAmount] = useState('');
    const address = web3.hook.usePriorityAccount();
    const stake = client.stake.useEps();
    const nuggft = useNuggftV1();
    const token = client.live.token(data.tokenId);

    const swap = React.useMemo(() => {
        return token?.activeSwap;
    }, [token?.activeSwap]);

    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();
    const closeModal = client.modal.useCloseModal();

    const [send, , hash, , ,] = usePrioritySendTransaction();

    useTransactionManager2(provider, hash, closeModal);

    const amountUsd = useUsdPair(amount);


    const populatedTransaction = useMemo(() => {
        if (swap && address) {
            if (data.isItem()) {
                return {
                    tx: nuggft.populateTransaction.claim(
                        [data.sellingNuggId.toRawId()],
                        [Address.ZERO.hash],
                        [data.sellingNuggId.toRawId()],
                        [data.tokenId.toRawId()],
                    ),
                    amount: BigNumber.from(0),
                };
            }
            return {
                tx: nuggft.populateTransaction.claim([data.tokenId.toRawId()], [address], [0], [0]),
                amount: BigNumber.from(0),
            };
        }
    }, [swap]);

    return token && chainId && provider && address ? (
        <div style={styles.container}>
            <Text textStyle={{ color: 'white' }}>
                {`${token.isNugg() ? t`Sell` : t`Sell Item:`} ${token.tokenId.toPrettyId()}`}
            </Text>
            <AnimatedCard>
                <TokenViewer tokenId={token.tokenId} showcase />
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
                            token.isNugg() ? (
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
                    label={`${token.isNugg() ? t`Sell Nugg` : t`Sell Item`}`}
                    onClick={() => {
                        void (data.isItem()
                            ? send(
                                  nuggft.populateTransaction['sell(uint24,uint16,uint96)'](
                                      data.sellingNuggId.toRawId(),
                                      token.tokenId.toRawId(),
                                      toEth(amount),
                                  ),
                              )
                            : send(
                                  nuggft.populateTransaction['sell(uint24,uint96)'](
                                      token.tokenId.toRawId(),
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
