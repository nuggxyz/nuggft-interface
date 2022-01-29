import { text } from 'stream/consumers';

import { BigNumber } from 'ethers';
import React, { FunctionComponent, useEffect, useState } from 'react';

import { EthInt } from '../../../../classes/Fraction';
import NuggftV1Helper from '../../../../contracts/NuggftV1Helper';
import useAsyncState from '../../../../hooks/useAsyncState';
import {
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../../../lib';
import { fromEth } from '../../../../lib/conversion';
import AppState from '../../../../state/app';
import SwapState from '../../../../state/swap';
import TokenState from '../../../../state/token';
import TransactionState from '../../../../state/transaction';
import WalletState from '../../../../state/wallet';
import Web3State from '../../../../state/web3';
import Button from '../../../general/Buttons/Button/Button';
import CurrencyInput from '../../../general/TextInputs/CurrencyInput/CurrencyInput';
import Text from '../../../general/Texts/Text/Text';
import TokenViewer from '../../TokenViewer';
import FeedbackButton from '../../../general/Buttons/FeedbackButton/FeedbackButton';
import useHandleError from '../../../../hooks/useHandleError';
import AnimatedCard from '../../../general/Cards/AnimatedCard/AnimatedCard';
import FontSize from '../../../../lib/fontSize';
import Layout from '../../../../lib/layout';

import styles from './LoanInputModal.styles';

type Props = {};

const LoanInputModal: FunctionComponent<Props> = () => {
    const [swapError, clearError] = useHandleError('GAS_ERROR');
    const [amount, setAmount] = useState('');
    const address = Web3State.select.web3address();
    const toggle = TransactionState.select.toggleCompletedTxn();
    const { targetId, type } = AppState.select.modalData();

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

    const userBalance = useAsyncState(
        () => NuggftV1Helper.ethBalance(Web3State.getLibraryOrProvider()),
        [address, stableId],
    );

    const amountFromChain = useAsyncState(
        () =>
            stableId &&
            (stableType === 'PayOffLoan'
                ? NuggftV1Helper.instance
                      .connect(Web3State.getLibraryOrProvider())
                      .vfl([stableId])
                : NuggftV1Helper.instance
                      .connect(Web3State.getLibraryOrProvider())
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
                                fontFamily: Layout.font.inter.bold,
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
                    <Text
                        type="text"
                        size="small"
                        textStyle={styles.text}
                        weight="bolder">
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
                    label={`${
                        stableType === 'PayOffLoan' ? 'Payoff' : 'Extend'
                    }`}
                    onClick={() =>
                        stableType === 'PayOffLoan'
                            ? WalletState.dispatch.payOffLoan({
                                  tokenId: stableId,
                                  amount: amount,
                              })
                            : WalletState.dispatch.extend({
                                  tokenId: stableId,
                                  amount: amount,
                              })
                    }
                />
            </div>
        </div>
    );
};

export default LoanInputModal;
