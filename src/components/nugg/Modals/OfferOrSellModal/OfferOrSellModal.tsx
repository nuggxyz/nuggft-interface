import { text } from 'stream/consumers';

import { BigNumber } from 'ethers';
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';

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
import constants from '../../../../lib/constants';
import FeedbackButton from '../../../general/Buttons/FeedbackButton/FeedbackButton';
import { Address } from '../../../../classes/Address';
import Web3Config from '../../../../state/web3/Web3Config';

import styles from './OffeOrSellModal.styles';

type Props = {};

const OfferOrSellModal: FunctionComponent<Props> = () => {
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
                .valueForDelegate(address, nugg.id),
        [address, nugg],
    );

    const minOfferAmount = useMemo(() => {
        if (!isUndefinedOrNullOrObjectEmpty(amountArray)) {
            if (!amountArray.senderCurrentOffer.isZero()) {
                return fromEth(
                    amountArray?.nextSwapAmount
                        .sub(amountArray?.senderCurrentOffer)
                        .div(10 ** 13)
                        .add(1)
                        .mul(10 ** 13),
                );
            } else {
                return Math.max(
                    +fromEth(
                        amountArray.nextSwapAmount
                            .sub(amountArray.senderCurrentOffer)
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

    useEffect(() => {
        setAmount(`${minOfferAmount}`);
    }, [minOfferAmount]);

    return (
        <div style={styles.container}>
            <Text textStyle={{ color: 'white' }}>
                {stableType === 'StartSale'
                    ? 'Sell your nugg'
                    : 'Bid on this nugg'}
            </Text>
            <TokenViewer tokenId={stableId || nugg?.id} />
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
                    {stableType === 'Offer' && userBalance && (
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
                        {amountArray && amountArray.canDelegate
                            ? `${
                                  stableType === 'StartSale' ? 'Sale' : 'Offer'
                              } must be at least ${minOfferAmount} ETH`
                            : `You cannot ${
                                  stableType === 'StartSale'
                                      ? 'sell'
                                      : 'place an offer on'
                              } this Nugg`}
                    </Text>
                </div>
            </div>
            <div style={styles.subContainer}>
                <FeedbackButton
                    feedbackText="Check Wallet..."
                    disabled={amountArray && !amountArray.canDelegate}
                    buttonStyle={styles.button}
                    label={
                        isApproved
                            ? `${
                                  stableType === 'StartSale'
                                      ? 'Sell'
                                      : 'Place offer for'
                              } Nugg #${stableId || nugg?.id}`
                            : `Approve Nugg #${stableId || nugg?.id}`
                    }
                    onClick={() =>
                        isApproved
                            ? stableType === 'Offer'
                                ? SwapState.dispatch.placeOffer({
                                      tokenId: nugg?.id,
                                      amount,
                                  })
                                : TokenState.dispatch.initSale({
                                      tokenId: stableId,
                                      floor: amountArray.nextSwapAmount,
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
