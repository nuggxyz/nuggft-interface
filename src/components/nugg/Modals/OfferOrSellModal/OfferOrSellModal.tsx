import { BigNumber } from 'ethers';
import React, { FunctionComponent, useEffect, useState } from 'react';

import { EthInt } from '../../../../classes/Fraction';
import NuggFTHelper from '../../../../contracts/NuggFTHelper';
import useAsyncState from '../../../../hooks/useAsyncState';
import { isUndefinedOrNullOrStringEmpty } from '../../../../lib';
import { fromEth } from '../../../../lib/conversion';
import AppState from '../../../../state/app';
import SwapState from '../../../../state/swap';
import TokenState from '../../../../state/token';
import TransactionState from '../../../../state/transaction';
import WalletState from '../../../../state/wallet';
import Button from '../../../general/Buttons/Button/Button';
import CurrencyInput from '../../../general/TextInputs/CurrencyInput/CurrencyInput';
import Text from '../../../general/Texts/Text/Text';
import TokenViewer from '../../TokenViewer';

import styles from './OffeOrSellrModal.styles';

type Props = {};

const OfferOrSellModal: FunctionComponent<Props> = () => {
    const [amount, setAmount] = useState('');
    const toggle = TransactionState.select.toggleCompletedTxn();
    const minimum = SwapState.select.eth();
    const nugg = SwapState.select.nugg();
    console.log(nugg);

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
            NuggFTHelper.sellerApproval(targetId).then((res) =>
                setIsApproved(res),
            );
        } else setIsApproved(true);
    }, [targetId, toggle, isApproved]);

    return (
        <div style={styles.container}>
            <TokenViewer tokenId={nugg.id} showLabel labelColor="white" />
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
                <Text textStyle={styles.text}>
                    Offer must be greater than {minimum ? fromEth(minimum) : 0}{' '}
                    ETH
                </Text>
            </div>
            <div style={styles.subContainer}>
                <Button
                    buttonStyle={styles.button}
                    label={
                        isApproved
                            ? `${
                                  stableType === 'StartSale'
                                      ? 'Sell'
                                      : 'Place offer for'
                              } Nugg #${stableId || nugg.id}`
                            : `Approve Nugg #${stableId || nugg.id}`
                    }
                    onClick={() =>
                        isApproved
                            ? stableType === 'Offer'
                                ? SwapState.dispatch.placeOffer({
                                      tokenId: nugg.id,
                                      amount: amount,
                                  })
                                : TokenState.dispatch.initSale({
                                      tokenId: stableId,
                                  })
                            : WalletState.dispatch.approveNugg({
                                  tokenId: stableId,
                              })
                    }
                />
            </div>
        </div>
    );
};

export default OfferOrSellModal;
