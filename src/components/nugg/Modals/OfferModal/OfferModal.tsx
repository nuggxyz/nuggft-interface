import React, { FC, FunctionComponent, useEffect, useMemo, useState } from 'react';

import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import useAsyncState from '@src/hooks/useAsyncState';
import { extractItemId, isUndefinedOrNullOrStringEmpty, parseTokenId } from '@src/lib';
import { fromEth, toEth } from '@src/lib/conversion';
import Button from '@src/components/general/Buttons/Button/Button';
import CurrencyInput from '@src/components/general/TextInputs/CurrencyInput/CurrencyInput';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import Layout from '@src/lib/layout';
import FontSize from '@src/lib/fontSize';
import useHandleError from '@src/hooks/useHandleError';
import web3 from '@src/web3';
import state from '@src/state';
import { TokenId } from '@src/client/router';
import WalletState from '@src/state/wallet';
import client from '@src/client';
import { ListRenderItemProps } from '@src/components/general/List/InfiniteList';
import Colors from '@src/lib/colors';
import { MyNuggsData } from '@src/client/core';
import List from '@src/components/general/List/List';

import styles from './OfferModal.styles';

type Props = {
    tokenId: TokenId;
};

const OfferModal: FunctionComponent<Props> = ({ tokenId }) => {
    const [swapError, clearError] = useHandleError('GAS_ERROR');
    const [amount, setAmount] = useState('');
    const address = web3.hook.usePriorityAccount();

    const [selectedNuggForItem, setSelectedNugg] = useState<MyNuggsData>();

    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();
    const epoch = client.live.epoch__id();

    const userBalance = web3.hook.usePriorityBalance(provider);

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

    const _myNuggs = client.live.myNuggs();
    const myNuggs = useMemo(
        () => _myNuggs.filter((nugg) => !(nugg.activeLoan || nugg.activeSwap)),
        [_myNuggs],
    );
    useEffect(() => {
        const prevBidder = myNuggs.find((nugg) =>
            nugg.unclaimedOffers.find(
                (offer) => offer.endingEpoch <= epoch && offer.itemId === targetId,
            ),
        );
        if (prevBidder) {
            setSelectedNugg(prevBidder);
        }
    }, [myNuggs, epoch, targetId]);

    const activeItem = client.live.activeNuggItem(stableId);

    const check = useAsyncState(() => {
        if (stableId && address && chainId && provider) {
            if (stableType === 'OfferNugg') {
                return new NuggftV1Helper(chainId, provider).contract['check(address,uint160)'](
                    address,
                    stableId,
                );
            } else if (stableType === 'OfferItem' && activeItem && selectedNuggForItem) {
                return new NuggftV1Helper(chainId, provider).contract[
                    'check(uint160,uint160,uint16)'
                ](selectedNuggForItem.tokenId, activeItem.sellingNugg, extractItemId(stableId));
            }
        }
    }, [stableId, address, chainId, provider, stableType, selectedNuggForItem, activeItem]);

    return (
        <div style={styles.container}>
            <Text textStyle={{ color: 'white' }}>
                {`${
                    check && check.current.toString() !== '0' ? 'Change offer for' : 'Offer on'
                } ${parseTokenId(stableId, true)}`}
            </Text>
            <AnimatedCard>
                <TokenViewer
                    tokenId={stableId}
                    showcase
                    style={stableType === 'OfferItem' ? { height: '350px', width: '350px' } : {}}
                />
            </AnimatedCard>
            {stableType === 'OfferItem' && (
                <List
                    data={myNuggs}
                    label="Pick a nugg to offer on this item"
                    labelStyle={{
                        color: 'white',
                    }}
                    RenderItem={MyNuggRenderItem}
                    horizontal
                    action={setSelectedNugg}
                    selected={selectedNuggForItem}
                    style={{
                        width: '100%',
                        background: Colors.transparentLightGrey,
                        height: '140px',
                        padding: '0rem .4rem',
                        borderRadius: Layout.borderRadius.medium,
                    }}
                />
            )}
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
                            onClick={() => setAmount(check ? fromEth(check.next) : '')}
                            disabled={stableType === 'OfferItem' && !selectedNuggForItem}
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
                {userBalance && (
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
                    disabled={!check || !check.canOffer}
                    feedbackText="Check Wallet..."
                    buttonStyle={styles.button}
                    label={`${
                        check && check.current.toString() !== '0'
                            ? !check.canOffer
                                ? 'You cannot place an offer'
                                : 'Update offer'
                            : 'Place offer'
                    }`}
                    onClick={() =>
                        WalletState.dispatch.placeOffer({
                            tokenId: stableId,
                            amount: fromEth(toEth(amount).sub(check.current)),
                            chainId,
                            provider,
                            address,
                            buyingTokenId:
                                stableType === 'OfferItem' && selectedNuggForItem.tokenId,
                            sellingTokenId:
                                stableType === 'OfferItem' && activeItem && activeItem.sellingNugg,
                        })
                    }
                />
            </div>
        </div>
    );
};

const MyNuggRenderItem: FC<ListRenderItemProps<MyNuggsData, undefined>> = ({
    item,
    index,
    extraData,
    selected,
    action,
}) => {
    return (
        <Button
            buttonStyle={{
                background: selected ? Colors.transparentGrey2 : Colors.transparent,
                borderRadius: Layout.borderRadius.medium,
                transition: '.2s background ease',
            }}
            rightIcon={
                <TokenViewer
                    tokenId={item.tokenId}
                    style={{ width: '80px', height: '80px' }}
                    // data={item.dotnuggRawCache}
                    showLabel
                    disableOnClick
                />
            }
            onClick={() => action(item)}
        />
    );
};

const MemoRenderItem = React.memo(MyNuggRenderItem, (prev, curr) => {
    return prev.item.tokenId === curr.item.tokenId && prev.selected === curr.selected;
});

export default OfferModal;
