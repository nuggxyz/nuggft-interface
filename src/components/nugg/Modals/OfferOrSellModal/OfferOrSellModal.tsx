import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';

import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import useAsyncState from '@src/hooks/useAsyncState';
import { isUndefinedOrNullOrObjectEmpty, isUndefinedOrNullOrStringEmpty } from '@src/lib';
import { fromEth, toEth } from '@src/lib/conversion';
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
import web3 from '@src/web3';
import state from '@src/state';
import { TokenId } from '@src/client/router';
import WalletState from '@src/state/wallet';

import styles from './OfferOrSellModal.styles';

type Props = {
    tokenId: TokenId;
};

const OfferOrSellModal: FunctionComponent<Props> = ({ tokenId }) => {
    const [swapError, clearError] = useHandleError('GAS_ERROR');
    const [amount, setAmount] = useState('');
    const address = web3.hook.usePriorityAccount();

    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();

    const userBalance = web3.hook.usePriorityBalance(provider);

    const check = useAsyncState(() => {
        return (
            !check &&
            tokenId &&
            address &&
            chainId &&
            provider &&
            new NuggftV1Helper(chainId, provider).contract['check(address,uint160)'](
                address,
                tokenId,
            )
        );
    }, [tokenId, address, chainId, provider]);

    const minOfferAmount = useMemo(() => {
        if (!isUndefinedOrNullOrObjectEmpty(check)) {
            return fromEth(check.nextSwapAmount);
        }
        return constants.MIN_OFFER;
    }, [check, tokenId]);

    const { targetId, type } = state.app.select.modalData();

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

    // const sell = React.useCallback(async () => {
    //     const nuggft = new NuggftV1Helper(chainId, provider);
    //     await nuggft.contract.estimateGas['sell(uint160,uint96)'](stableId, toEth(amount))
    //         .then((x) => {
    //             console.log({ x });
    //         })
    //         .catch((err) => {
    //             console.log({ err });
    //         });
    // }, []);

    // const offer = React.useCallback(async () => {
    //     const nuggft = new NuggftV1Helper(chainId, provider);
    //     await nuggft.contract.estimateGas['offer(uint160)'](tokenId, {
    //         value: BigNumber.from(
    //             toEth(amount === '' ? '0' : amount).sub(check.senderCurrentOffer),
    //         ),
    //     })
    //         .then((H) => {
    //             console.log({ H });
    //         })
    //         .catch((G) => {
    //             // G.error.error.data;
    //             console.log(G.error.error.data);
    //         });
    // }, [chainId, tokenId, check, amount]);
    return (
        <div style={styles.container}>
            <Text textStyle={{ color: 'white' }}>
                {stableType === 'StartSale'
                    ? `Sell Nugg #${stableId || tokenId}`
                    : `${
                          check && check.senderCurrentOffer.toString() !== '0'
                              ? 'Change bid for'
                              : 'Bid on'
                      } Nugg #${stableId || tokenId}`}
            </Text>
            <AnimatedCard>
                <TokenViewer tokenId={stableId || tokenId} showcase />
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
                }}
            >
                {stableType === 'Offer' && userBalance && (
                    <Text type="text" size="smaller" textStyle={styles.text} weight="bolder">
                        You currently have
                        <Text
                            type="code"
                            size="smaller"
                            textStyle={{ marginLeft: '.5rem' }}
                            weight="bolder"
                        >
                            {userBalance.decimal.toNumber()} ETH
                        </Text>
                    </Text>
                )}
            </div>
            <div style={styles.subContainer}>
                <FeedbackButton
                    overrideFeedback
                    disabled={check && !check.canOffer}
                    feedbackText="Check Wallet..."
                    buttonStyle={styles.button}
                    label={`${
                        stableType === 'StartSale'
                            ? 'Sell Nugg'
                            : check && check.senderCurrentOffer.toString() !== '0'
                            ? !check.canOffer
                                ? 'You cannot offer on this Nugg'
                                : 'Update offer'
                            : 'Place offer'
                    }`}
                    onClick={() =>
                        stableType === 'Offer'
                            ? WalletState.dispatch.placeOffer({
                                  tokenId: tokenId,
                                  amount: fromEth(toEth(amount).sub(check.senderCurrentOffer)),
                                  chainId,
                                  provider,
                                  address,
                              })
                            : WalletState.dispatch.initSale({
                                  tokenId: stableId,
                                  floor: toEth(amount),
                                  chainId,
                                  provider,
                                  address,
                              })
                    }
                />
            </div>
        </div>
    );
};

export default OfferOrSellModal;
