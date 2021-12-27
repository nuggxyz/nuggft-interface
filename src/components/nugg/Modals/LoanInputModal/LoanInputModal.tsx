import { text } from 'stream/consumers';

import { BigNumber } from 'ethers';
import React, { FunctionComponent, useEffect, useState } from 'react';

import { EthInt } from '../../../../classes/Fraction';
import NuggFTHelper from '../../../../contracts/NuggFTHelper';
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

import styles from './LoanInputModal.styles';

type Props = {};

const LoanInputModal: FunctionComponent<Props> = () => {
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
        () => NuggFTHelper.ethBalance(Web3State.getLibraryOrProvider()),
        [address, stableId],
    );

    const amountFromChain = useAsyncState(
        () =>
            stableId && stableType === 'PayOffLoan'
                ? NuggFTHelper.instance
                      .connect(Web3State.getLibraryOrProvider())
                      .valueForPayoff(stableId)
                : NuggFTHelper.instance
                      .connect(Web3State.getLibraryOrProvider())
                      .valueForRebalance(stableId),
        [address, stableId, stableType],
    );

    useEffect(() => {
        if (!isUndefinedOrNullOrObjectEmpty(amountFromChain)) {
            setAmount(
                fromEth(
                    amountFromChain
                        .div(10 ** 13)
                        .add(1)
                        .mul(10 ** 13),
                ),
            );
        }
    }, [amountFromChain]);

    return (
        <div style={styles.container}>
            <TokenViewer tokenId={stableId} showLabel labelColor="white" />
            <div style={styles.inputContainer}>
                <CurrencyInput
                    style={styles.input}
                    styleHeading={styles.heading}
                    styleInput={styles.inputCurrency}
                    label="Enter amount"
                    setValue={setAmount}
                    value={amount}
                    code
                    className="placeholder-white"
                />
                <div style={{ width: '50%' }}>
                    {userBalance && (
                        <Text
                            type="text"
                            size="small"
                            textStyle={{ color: 'white', textAlign: 'right' }}
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
                    <Text textStyle={styles.text}>
                        {`${
                            stableType === 'PayOffLoan'
                                ? 'Payoff amount'
                                : 'Extension amount'
                        } is ${amount} ETH`}
                    </Text>
                </div>
            </div>
            <div style={styles.subContainer}>
                <Button
                    buttonStyle={styles.button}
                    label={`${
                        stableType === 'PayOffLoan' ? 'Payoff' : 'Extend'
                    } Nugg #${stableId}`}
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
