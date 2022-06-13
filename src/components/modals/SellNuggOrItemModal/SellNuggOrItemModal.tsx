import React, { useMemo, useState } from 'react';
import { t } from '@lingui/macro';
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';

import lib, { isUndefinedOrNullOrStringEmptyOrZeroOrStringZero } from '@src/lib';
import { DualCurrencyInput } from '@src/components/general/TextInputs/CurrencyInput/CurrencyInput';
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
import useAsyncState from '@src/hooks/useAsyncState';
import { EthInt } from '@src/classes/Fraction';
import globalStyles from '@src/lib/globalStyles';
import CurrencyToggler from '@src/components/general/Buttons/CurrencyToggler/CurrencyToggler';
import { useLiveTokenPoll } from '@src/client/subscriptions/useLiveNugg';

import styles from './SellNuggOrItemModal.styles';

const SellNuggOrItemModal = ({ data }: { data: SellModalData }) => {
    const address = web3.hook.usePriorityAccount();
    const network = web3.hook.useNetworkProvider();
    const stake = client.stake.useEps();
    const nuggft = useNuggftV1(network);
    const token = client.live.token(data.tokenId);
    useLiveTokenPoll(!token, data.tokenId);
    const myNuggs = client.user.useNuggs();
    const [lastPressed, setLastPressed] = React.useState<string | undefined>('5');
    const pref = client.usd.useCurrencyPreferrence();
    const [currencyPref, setCurrencyPref] = useState<'ETH' | 'USD'>(pref);

    const swap = React.useMemo(() => {
        return token?.activeSwap;
    }, [token?.activeSwap]);

    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();
    const closeModal = client.modal.useCloseModal();

    const [send, , hash, , ,] = usePrioritySendTransaction();

    const eps = useAsyncState(() => {
        return swap ? Promise.resolve(swap.eth) : nuggft.eps();
    }, [nuggft, stake, swap]);

    const epsUsd = useUsdPair(eps);
    const [amount, setAmount] = useState('0');

    useTransactionManager2(provider, hash, closeModal);

    const needToClaim = React.useMemo(() => {
        if (data.isItem()) {
            const nugg = myNuggs.find((x) => x.tokenId === data.sellingNuggId);

            if (nugg && nugg.pendingClaim) {
                return true;
            }
        }

        if (data.isNugg()) {
            const nugg = myNuggs.find((x) => x.tokenId === data.tokenId);

            if (nugg && nugg.pendingClaim) {
                return true;
            }
        }
        return false;
    }, [data, myNuggs]);

    const amountUsd = useUsdPair(amount);

    const [valueIsSet, setValue] = React.useReducer(() => true, false);

    const wrappedSetAmount = React.useCallback(
        (amt: string) => {
            setAmount(amt);
            setLastPressed(undefined);
        },
        [setAmount, setLastPressed],
    );

    React.useEffect(() => {
        if (eps && epsUsd && epsUsd.eth && !valueIsSet) {
            wrappedSetAmount(epsUsd.eth.copy().increase(BigInt(5)).number.toFixed(5));
            setLastPressed('5');
            setValue();
        }
    }, [amount, eps, epsUsd, epsUsd.eth, valueIsSet, setValue, wrappedSetAmount]);

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
        const value = amountUsd.eth.bignumber;

        if (!value.isZero()) {
            if (data.isItem()) {
                const sell = nuggft.populateTransaction['sell(uint24,uint16,uint96)'](
                    data.sellingNuggId.toRawId(),
                    data.tokenId.toRawId(),
                    value,
                );

                if (needToClaim && address) {
                    const claim = nuggft.populateTransaction.claim(
                        [data.sellingNuggId.toRawId()],
                        [address],
                        [0],
                        [0],
                    );

                    const multi = async () => {
                        return nuggft.populateTransaction.multicall([
                            (await claim).data || '0x0',
                            (await sell).data || '0x0',
                        ]);
                    };

                    return {
                        tx: multi(),
                        amount: value,
                    };
                }
                return {
                    tx: sell,

                    amount: value,
                };
            }

            const sell = nuggft.populateTransaction['sell(uint24,uint96)'](
                data.tokenId.toRawId(),
                value,
            );

            if (needToClaim && address) {
                const claim = nuggft.populateTransaction.claim(
                    [data.tokenId.toRawId()],
                    [address],
                    [0],
                    [0],
                );

                const multi = async () => {
                    return nuggft.populateTransaction.multicall([
                        (await claim).data || '0x0',
                        (await sell).data || '0x0',
                    ]);
                };

                return {
                    tx: multi(),
                    amount: value,
                };
            }
            return {
                tx: sell,
                amount: value,
            };
        }

        return undefined;
    }, [swap, amountUsd, address, needToClaim, data, nuggft]);
    const estimation = useAsyncState(() => {
        if (populatedTransaction && network) {
            return Promise.all([
                estimator.estimate(populatedTransaction.tx),
                network?.getGasPrice(),
            ]).then((_data) => ({
                gasLimit: _data[0] || BigNumber.from(0),
                gasPrice: new EthInt(_data[1] || 0),
                mul: new EthInt((_data[0] || BigNumber.from(0)).mul(_data[1] || 0)),
                amount: populatedTransaction.amount,
            }));
        }

        return undefined;
    }, [populatedTransaction, network]);

    const calculating = React.useMemo(() => {
        if (estimator.error) return false;
        if (populatedTransaction && estimation) {
            if (populatedTransaction.amount.eq(estimation.amount)) return false;
        }
        return true;
    }, [populatedTransaction, estimation]);

    const IncrementButton = React.memo(({ increment }: { increment: bigint }) => {
        return (
            <Button
                className="mobile-pressable-div"
                label={increment.toString() === '0' ? t`Min` : `+${increment.toString()}%`}
                onClick={() => {
                    wrappedSetAmount(
                        epsUsd.eth.copy().increase(increment).number.toFixed(5) || '0',
                    );
                    setLastPressed(increment.toString());
                }}
                buttonStyle={{
                    borderRadius: lib.layout.borderRadius.large,
                    padding: '.4rem .7rem',
                    background:
                        lastPressed === increment.toString()
                            ? lib.colors.white
                            : lib.colors.textColor,
                    boxShadow:
                        lastPressed === increment.toString()
                            ? `${lib.layout.boxShadow.medium}`
                            : '',
                    transition: `all .5s ${lib.layout.animation}`,
                }}
                size="medium"
                textStyle={{
                    color:
                        lastPressed === increment.toString()
                            ? lib.colors.textColor
                            : lib.colors.white,
                }}
            />
        );
    });

    return token && chainId && provider && address ? (
        <div style={styles.container}>
            <Text textStyle={{ color: lib.colors.textColor, marginBottom: '.3rem' }} size="large">
                {`${token.isNugg() ? t`Sell` : t`Sell Item:`} ${token.tokenId.toPrettyId()}`}
            </Text>
            <AnimatedCard>
                <TokenViewer tokenId={token.tokenId} showcase />
            </AnimatedCard>
            <div style={styles.inputContainer}>
                {stake ? (
                    <DualCurrencyInput
                        warning={
                            estimator.error && lib.errors.prettify('sell-modal', estimator.error)
                        }
                        shouldFocus
                        style={styles.input}
                        currencyPref={currencyPref}
                        styleHeading={styles.heading}
                        styleInputContainer={styles.inputCurrency}
                        styleLabel={{ color: lib.colors.textColor }}
                        label={t`Enter floor`}
                        setValue={wrappedSetAmount}
                        value={amount}
                        code
                        className="placeholder-white"
                        rightToggles={[
                            <CurrencyToggler
                                pref={currencyPref}
                                setPref={setCurrencyPref}
                                containerStyle={{ zIndex: 0 }}
                            />,
                        ]}
                    />
                ) : null}
                <div
                    style={{
                        // display: 'flex',
                        margin: '.7rem 0rem',
                        width: '100%',
                        ...globalStyles.centeredSpaceBetween,
                    }}
                >
                    <IncrementButton increment={BigInt(0)} />
                    <IncrementButton increment={BigInt(5)} />
                    <IncrementButton increment={BigInt(10)} />
                    <IncrementButton increment={BigInt(15)} />
                    <IncrementButton increment={BigInt(20)} />
                    <IncrementButton increment={BigInt(25)} />
                    <IncrementButton increment={BigInt(30)} />
                </div>
            </div>
            <div style={styles.subContainer}>
                <FeedbackButton
                    overrideFeedback
                    disabled={
                        isUndefinedOrNullOrStringEmptyOrZeroOrStringZero(amount) ||
                        calculating ||
                        !!estimator.error
                    }
                    feedbackText={t`Check Wallet...`}
                    buttonStyle={styles.button}
                    textStyle={{ color: 'white' }}
                    label={`${token.isNugg() ? t`Sell Nugg` : t`Sell Item`}`}
                    onClick={() => {
                        if (populatedTransaction) {
                            void send(populatedTransaction.tx);
                        }
                        // void (data.isItem()
                        //     ? send(
                        //           nuggft.populateTransaction['sell(uint24,uint16,uint96)'](
                        //               data.sellingNuggId.toRawId(),
                        //               token.tokenId.toRawId(),
                        //               toEth(amount),
                        //           ),
                        //       )
                        //     : send(
                        //           nuggft.populateTransaction['sell(uint24,uint96)'](
                        //               token.tokenId.toRawId(),
                        //               toEth(amount),
                        //           ),
                        //       ));
                    }}
                />
            </div>
        </div>
    ) : null;
};

export default SellNuggOrItemModal;
