import { text } from 'stream/consumers';

import { BigNumber } from 'ethers';
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';

import { EthInt } from '../../../../classes/Fraction';
import NuggftV1Helper from '../../../../contracts/NuggftV1Helper';
import useAsyncState from '../../../../hooks/useAsyncState';
import {
    isUndefinedOrNullOrNumberZero,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../../../lib';
import { fromEth, toEth } from '../../../../lib/conversion';
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
import constants from '../../../../lib/constants';
import FeedbackButton from '../../../general/Buttons/FeedbackButton/FeedbackButton';
import { Address } from '../../../../classes/Address';
import Web3Config from '../../../../state/web3/Web3Config';
import AnimatedCard from '../../../general/Cards/AnimatedCard/AnimatedCard';
import Layout from '../../../../lib/layout';
import FontSize from '../../../../lib/fontSize';
import useHandleError from '../../../../hooks/useHandleError';

import styles from './OfferOrSellModal.styles';

type Props = {};

const OfferOrSellModal: FunctionComponent<Props> = () => {
    const [swapError, clearError] = useHandleError('GAS_ERROR');
    const [amount, setAmount] = useState('');
    const address = Web3State.select.web3address();
    const toggle = TransactionState.select.toggleCompletedTxn();
    const nugg = SwapState.select.nugg();

    const userBalance = useAsyncState(
        () => NuggftV1Helper.ethBalance(Web3State.getLibraryOrProvider()),
        [address, nugg],
    );

    const amountArray = useAsyncState(
        () =>
            nugg &&
            NuggftV1Helper.instance
                .connect(Web3State.getLibraryOrProvider())
                .valueForOffer(address, nugg.id),
        [address, nugg],
    );

    const minOfferAmount = useMemo(() => {
        if (!isUndefinedOrNullOrObjectEmpty(amountArray)) {
            if (!amountArray.senderCurrentOffer.isZero()) {
                return fromEth(
                    amountArray?.nextSellAmount
                        // .sub(amountArray?.senderCurrentOffer)
                        .div(10 ** 13)
                        .add(1)
                        .mul(10 ** 13),
                );
            } else {
                return Math.max(
                    +fromEth(
                        amountArray.nextSellAmount
                            // .sub(amountArray.senderCurrentOffer)
                            .div(10 ** 13)
                            .add(1)
                            .mul(10 ** 13),
                    ),
                    constants.MIN_OFFER,
                );
            }
        }
        return constants.MIN_OFFER;
    }, [amountArray]);

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

    const [isApproved, setIsApproved] = useState(false);

    useEffect(() => {
        if (
            !isUndefinedOrNullOrStringEmpty(targetId) &&
            !isApproved &&
            stableType === 'StartSale'
        ) {
            NuggftV1Helper.sellerApproval(stableId).then((res) =>
                setIsApproved(res),
            );
        } else setIsApproved(true);
    }, [targetId, toggle, isApproved, stableId, stableType]);

    return (
        <div style={styles.container}>
            <Text textStyle={{ color: 'white' }}>
                {stableType === 'StartSale'
                    ? `Sell Nugg #${stableId || nugg?.id}`
                    : `${
                          amountArray &&
                          !isUndefinedOrNullOrNumberZero(
                              amountArray.senderCurrentOffer.toNumber(),
                          )
                              ? 'Change bid for'
                              : 'Bid on'
                      } Nugg #${stableId || nugg?.id}`}
            </Text>
            <AnimatedCard>
                <TokenViewer tokenId={stableId || nugg?.id} />
            </AnimatedCard>
            <div style={styles.inputContainer}>
                <CurrencyInput
                    warning={swapError && 'Invalid input'}
                    shouldFocus
                    style={styles.input}
                    styleHeading={styles.heading}
                    styleInputContainer={styles.inputCurrency}
                    label={
                        stableType === 'StartSale'
                            ? 'Enter floor'
                            : 'Enter amount'
                    }
                    setValue={(text: string) => {
                        setAmount(text);
                        clearError();
                    }}
                    value={amount}
                    code
                    className="placeholder-white"
                    rightToggles={[
                        <Button
                            onClick={() => setAmount(`${minOfferAmount}`)}
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
                {stableType === 'Offer' && userBalance && (
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
                        {amountArray && amountArray.canOffer
                            ? `${
                                  stableType === 'StartSale' ? 'Sale' : 'Offer'
                              } must be at least ${minOfferAmount} ETH`
                            : `You cannot ${
                                  stableType === 'StartSale'
                                      ? 'sell'
                                      : 'place an offer on'
                              } this Nugg`}
                    </Text> */}
            </div>
            <div style={styles.subContainer}>
                <FeedbackButton
                    overrideFeedback
                    feedbackText="Check Wallet..."
                    disabled={amountArray && !amountArray.canOffer}
                    buttonStyle={styles.button}
                    label={
                        amountArray && !amountArray.canOffer
                            ? `You cannot ${
                                  stableType === 'StartSale'
                                      ? 'sell'
                                      : 'place an offer on'
                              } this Nugg`
                            : isApproved
                            ? `${
                                  stableType === 'StartSale'
                                      ? 'Sell Nugg'
                                      : amountArray &&
                                        !isUndefinedOrNullOrNumberZero(
                                            amountArray.senderCurrentOffer.toNumber(),
                                        )
                                      ? 'Update offer'
                                      : 'Place offer'
                              }`
                            : `Approve Nugg #${stableId || nugg?.id}`
                    }
                    onClick={() =>
                        isApproved
                            ? stableType === 'Offer'
                                ? SwapState.dispatch.placeOffer({
                                      tokenId: nugg?.id,
                                      amount: fromEth(
                                          toEth(amount).sub(
                                              amountArray.senderCurrentOffer,
                                          ),
                                      ),
                                  })
                                : TokenState.dispatch.initSale({
                                      tokenId: stableId,
                                      floor: amountArray.nextSellAmount,
                                  })
                            : WalletState.dispatch.approveNugg({
                                  spender: new Address(
                                      Web3Config.activeChain__NuggftV1,
                                  ),
                                  tokenId: stableId,
                              })
                    }
                />
            </div>
        </div>
    );
};

export default OfferOrSellModal;
