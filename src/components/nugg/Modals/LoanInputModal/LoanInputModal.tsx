import React, { FunctionComponent, useEffect, useState } from 'react';
import { BigNumber } from '@ethersproject/bignumber';

import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import useAsyncState from '@src/hooks/useAsyncState';
import { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import { fromEth } from '@src/lib/conversion';
import AppState from '@src/state/app';
import WalletState from '@src/state/wallet';
import Button from '@src/components/general/Buttons/Button/Button';
import CurrencyInput from '@src/components/general/TextInputs/CurrencyInput/CurrencyInput';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import FontSize from '@src/lib/fontSize';
import Layout from '@src/lib/layout';
import web3 from '@src/web3';

import styles from './LoanInputModal.styles';

type Props = Record<string, never>;

const LoanInputModal: FunctionComponent<Props> = () => {
    // const [swapError, clearError] = useHandleError('GAS_ERROR');
    const [amount, setAmount] = useState('');
    const address = web3.hook.usePriorityAccount();
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

    const userBalance = web3.hook.usePriorityBalance(provider);

    const amountFromChain = useAsyncState<BigNumber[]>(
        () =>
            stableId && chainId && provider
                ? stableType === 'PayoffLoan'
                    ? new NuggftV1Helper(chainId, provider).contract.vfl([stableId]).then((v) => {
                          return v;
                      })
                    : new NuggftV1Helper(chainId, provider).contract.vfr([stableId]).then((v) => {
                          return v;
                      })
                : new Promise((resolve) => resolve([])),
        [address, stableId, stableType, chainId, provider],
    );

    return stableId &&
        amountFromChain &&
        amountFromChain.length > 0 &&
        chainId &&
        provider &&
        address ? (
        <div style={styles.container}>
            <Text textStyle={{ color: 'white' }}>{`${
                stableType === 'PayoffLoan' ? 'Payoff' : 'Extend'
            } Nugg #${stableId}`}</Text>
            <AnimatedCard>
                <TokenViewer tokenId={stableId} labelColor="white" showcase />
            </AnimatedCard>
            <div style={styles.inputContainer}>
                <CurrencyInput
                    // warning={swapError && 'Invalid input'}
                    shouldFocus
                    style={styles.input}
                    styleHeading={styles.heading}
                    styleInputContainer={styles.inputCurrency}
                    label="Enter amount"
                    setValue={(text: string) => {
                        setAmount(text);
                        // clearError();
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
                }}
            >
                {userBalance ? (
                    <Text type="text" size="small" textStyle={styles.text} weight="bolder">
                        You currently have {userBalance.num} ETH
                    </Text>
                ) : null}
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
                    label={`${stableType === 'PayoffLoan' ? 'Payoff' : 'Extend'}`}
                    onClick={() =>
                        stableType === 'PayoffLoan'
                            ? WalletState.dispatch.payOffLoan({
                                  tokenId: stableId,
                                  amount: amount,
                                  chainId,
                                  provider,
                                  address,
                              })
                            : WalletState.dispatch.extend({
                                  tokenId: stableId,
                                  amount: amount,
                                  chainId,
                                  provider,
                                  address,
                              })
                    }
                />
            </div>
        </div>
    ) : null;
};

export default LoanInputModal;
