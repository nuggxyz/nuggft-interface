import React, { FunctionComponent, useEffect, useState } from 'react';

import { EthInt } from '@src/classes/Fraction';
import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import useAsyncState from '@src/hooks/useAsyncState';
import { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import { fromEth } from '@src/lib/conversion';
import AppState from '@src/state/app';
import TransactionState from '@src/state/transaction';
import WalletState from '@src/state/wallet';
import Button from '@src/components/general/Buttons/Button/Button';
import CurrencyInput from '@src/components/general/TextInputs/CurrencyInput/CurrencyInput';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import useHandleError from '@src/hooks/useHandleError';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import FontSize from '@src/lib/fontSize';
import Layout from '@src/lib/layout';
import web3 from '@src/web3';

import styles from './LoanInputModal.styles';

type Props = {};

const LoanInputModal: FunctionComponent<Props> = () => {
    const [swapError, clearError] = useHandleError('GAS_ERROR');
    const [amount, setAmount] = useState('');
    const address = web3.hook.usePriorityAccount();
    const toggle = TransactionState.select.toggleCompletedTxn();
    const { targetId, type } = AppState.select.modalData();

    const [stableType, setType] = useState(type);
    const [stableId, setId] = useState(targetId);
    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();
    useEffect(() => {
        if (!isUndefinedOrNullOrStringEmpty(type)) {
            setType(type);
        }
        if (!isUndefinedOrNullOrStringEmpty(targetId)) {
            setId(targetId);
        }
    }, [type, targetId]);

    const userBalance = useAsyncState(
        () => provider && address && provider.getBalance(address),
        [address, provider],
    );

    const amountFromChain = useAsyncState(
        () =>
            stableId &&
            (stableType === 'PayOffLoan'
                ? new NuggftV1Helper(chainId, provider).contract
                      //   .connect(Web3State.getSignerOrProvider())
                      .vfl([stableId])
                : new NuggftV1Helper(chainId, provider).contract
                      //   .connect(Web3State.getSignerOrProvider())
                      .vfr([stableId])),
        [address, stableId, stableType],
    );

    // useEffect(() => {
    //     if (!isUndefinedOrNullOrObjectEmpty(amountFromChain)) {
    //         setAmount(
    //             fromEth(
    //                 amountFromChain
    //                     .div(10 ** 13)
    //                     .add(1)
    //                     .mul(10 ** 13),
    //             ),
    //         );
    //     }
    // }, [amountFromChain]);

    return (
        <div style={styles.container}>
            <Text textStyle={{ color: 'white' }}>{`${
                stableType === 'PayOffLoan' ? 'Payoff' : 'Extend'
            } Nugg #${stableId}`}</Text>
            <AnimatedCard>
                <TokenViewer tokenId={stableId} labelColor="white" />
            </AnimatedCard>
            <div style={styles.inputContainer}>
                <CurrencyInput
                    warning={swapError && 'Invalid input'}
                    shouldFocus
                    style={styles.input}
                    styleHeading={styles.heading}
                    styleInputContainer={styles.inputCurrency}
                    label="Enter amount"
                    setValue={(text: string) => {
                        setAmount(text);
                        clearError();
                    }}
                    value={amount}
                    code
                    className="placeholder-white"
                    rightToggles={[
                        <Button
                            onClick={() =>
                                setAmount(
                                    `${fromEth(
                                        amountFromChain[0]
                                            .div(10 ** 13)
                                            .add(1)
                                            .mul(10 ** 13),
                                    )}`,
                                )
                            }
                            label="Min"
                            textStyle={{
                                fontFamily: Layout.font.sf.bold,
                                fontSize: FontSize.h6,
                            }}
                            buttonStyle={{
                                borderRadius: Layout.borderRadius.large,
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
                }}>
                {userBalance && (
                    <Text type="text" size="small" textStyle={styles.text} weight="bolder">
                        You currently have{' '}
                        {new EthInt(
                            userBalance
                                .div(10 ** 13)
                                .add(1)
                                .mul(10 ** 13),
                        ).decimal.toNumber()}{' '}
                        ETH
                    </Text>
                )}
                {/* <Text textStyle={styles.text}>
                        {`${
                            stableType === 'PayOffLoan'
                                ? 'Payoff amount'
                                : 'Extension amount'
                        } is ${amount} ETH`}
                    </Text> */}
            </div>
            <div style={styles.subContainer}>
                <FeedbackButton
                    feedbackText="Check Wallet..."
                    buttonStyle={styles.button}
                    label={`${stableType === 'PayOffLoan' ? 'Payoff' : 'Extend'}`}
                    onClick={() =>
                        stableType === 'PayOffLoan'
                            ? WalletState.dispatch.payOffLoan({
                                  tokenId: stableId,
                                  amount: amount,
                                  chainId,
                                  provider,
                              })
                            : WalletState.dispatch.extend({
                                  tokenId: stableId,
                                  amount: amount,
                                  chainId,
                                  provider,
                              })
                    }
                />
            </div>
        </div>
    );
};

export default LoanInputModal;
