import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';

import { EthInt } from '@src/classes/Fraction';
import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import useAsyncState from '@src/hooks/useAsyncState';
import {
    isUndefinedOrNullOrNumberZero,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '@src/lib';
import { fromEth } from '@src/lib/conversion';
import AppState from '@src/state/app';
import SwapState from '@src/state/swap';
import TokenState from '@src/state/token';
import TransactionState from '@src/state/transaction';
import Button from '@src/components/general/Buttons/Button/Button';
import CurrencyInput from '@src/components/general/TextInputs/CurrencyInput/CurrencyInput';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import constants from '@src/lib/constants';
import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import Layout from '@src/lib/layout';
import FontSize from '@src/lib/fontSize';
import useHandleError from '@src/hooks/useHandleError';
import config from '@src/web3/config';

import styles from './OfferOrSellModal.styles';

type Props = {};

const OfferOrSellModal: FunctionComponent<Props> = () => {
    const [swapError, clearError] = useHandleError('GAS_ERROR');
    const [amount, setAmount] = useState('');
    const address = config.priority.usePriorityAccount();
    const toggle = TransactionState.select.toggleCompletedTxn();
    const nugg = SwapState.select.nugg();

    const provider = config.priority.usePriorityProvider();
    const chainId = config.priority.usePriorityChainId();

    const userBalance = useAsyncState(
        () => provider && provider.getBalance(address),
        [address, provider, chainId],
    );

    // const VFO = useAsyncState(
    //     () =>
    //         nugg &&
    //         new NuggftV1Helper(chainId, provider).contract
    //             .connect(Web3State.getLibraryOrProvider())
    //             ['vfo(address,uint160)'](address, nugg.id),
    //     [address, nugg],
    // );

    const check = useAsyncState(
        () =>
            nugg &&
            new NuggftV1Helper(chainId, provider).contract['vfo(address,uint160)'](
                address,
                nugg.id,
            ),
        [address, nugg],
    );

    const minOfferAmount = useMemo(() => {
        if (!isUndefinedOrNullOrObjectEmpty(check)) {
            return check;
        }
        return constants.MIN_OFFER;
    }, [check]);

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

    return (
        <div style={styles.container}>
            <Text textStyle={{ color: 'white' }}>
                {stableType === 'StartSale'
                    ? `Sell Nugg #${stableId || nugg?.id}`
                    : `${
                          check && !isUndefinedOrNullOrNumberZero(check.toNumber())
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
                    label={stableType === 'StartSale' ? 'Enter floor' : 'Enter amount'}
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
                {stableType === 'Offer' && userBalance && (
                    <Text type="text" size="smaller" textStyle={styles.text} weight="bolder">
                        You currently have
                        <Text
                            type="code"
                            size="smaller"
                            textStyle={{ marginLeft: '.5rem' }}
                            weight="bolder">
                            {new EthInt(
                                userBalance
                                    .div(10 ** 13)

                                    .add(1)
                                    .mul(10 ** 13),
                            ).decimal.toNumber()}{' '}
                            ETH
                        </Text>
                    </Text>
                )}
                {/* <Text textStyle={styles.text}>
                        {check && check.canOffer
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
                    // disabled={check && !check.canOffer}
                    // TODO find better way to do this with vfo
                    buttonStyle={styles.button}
                    label={`${
                        stableType === 'StartSale'
                            ? 'Sell Nugg'
                            : check && !isUndefinedOrNullOrNumberZero(check.toNumber())
                            ? 'Update offer'
                            : 'Place offer'
                    }`}
                    onClick={() =>
                        stableType === 'Offer'
                            ? SwapState.dispatch.placeOffer({
                                  tokenId: nugg?.id,
                                  amount: fromEth(check),
                                  chainId,
                                  provider,
                              })
                            : TokenState.dispatch.initSale({
                                  tokenId: stableId,
                                  floor: fromEth(check),
                                  chainId,
                                  provider,
                              })
                    }
                />
            </div>
        </div>
    );
};

export default OfferOrSellModal;
