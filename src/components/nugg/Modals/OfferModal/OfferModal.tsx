import React, { FC, useEffect, useMemo, useState } from 'react';
import { BigNumber } from 'ethers';

import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import useAsyncState from '@src/hooks/useAsyncState';
import { extractItemId, parseTokenId } from '@src/lib';
import { fromEth, toEth } from '@src/lib/conversion';
import Button from '@src/components/general/Buttons/Button/Button';
import CurrencyInput from '@src/components/general/TextInputs/CurrencyInput/CurrencyInput';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import Layout from '@src/lib/layout';
import FontSize from '@src/lib/fontSize';
import web3 from '@src/web3';
import state from '@src/state';
import { TokenId } from '@src/client/router';
import client from '@src/client';
import Colors from '@src/lib/colors';
import List, { ListRenderItemProps } from '@src/components/general/List/List';
import { LiveToken } from '@src/client/hooks/useLiveToken';
import { TryoutData } from '@src/client/hooks/useLiveItem';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import WalletState from '@src/state/wallet';
import { MyNuggsData } from '@src/client/interfaces';
import Label from '@src/components/general/Label/Label';

import styles from './OfferModal.styles';

const MyNuggRenderItem: FC<ListRenderItemProps<MyNuggsData, undefined, MyNuggsData>> = ({
    item,
    selected,
    action,
}) => {
    const disabled = React.useMemo(() => {
        if (item.activeSwap) return 'currenlty for sale';
        if (item.unclaimedOffers.length > 0) return 'previous claim pending for this item';
        return undefined;
    }, [item]);
    return (
        <Button
            disabled={!!disabled}
            buttonStyle={{
                background: selected ? Colors.transparentGrey2 : Colors.transparent,
                borderRadius: Layout.borderRadius.medium,
                transition: '.2s background ease',
            }}
            rightIcon={
                <>
                    <TokenViewer
                        tokenId={item.tokenId}
                        style={{ width: '80px', height: '80px' }}
                        showLabel
                        disableOnClick
                    />
                    {disabled && (
                        <Label text={disabled} containerStyles={{ background: 'transparent' }} />
                    )}
                </>
            }
            onClick={() => action && action(item)}
        />
    );
};

const SellingNuggRenderItem: FC<ListRenderItemProps<TryoutData, undefined, TryoutData>> = ({
    item: tryoutData,
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
                <div>
                    <TokenViewer
                        tokenId={tryoutData.nugg}
                        style={{ width: '80px', height: '80px' }}
                        showLabel
                        disableOnClick
                    />
                    <CurrencyText value={tryoutData.eth.decimal.toNumber()} />
                </div>
            }
            onClick={() => action && action(tryoutData)}
        />
    );
};

type Props = {
    tokenId: TokenId;
};

const OfferModal = ({ tokenId }: Props) => {
    const [amount, setAmount] = useState('');
    const address = web3.hook.usePriorityAccount();

    const [selectedNuggForItem, setSelectedNugg] = useState<MyNuggsData>();
    const [selectedSellingNuggForItem, setSelectedSellingNugg] = useState<TryoutData>();

    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();
    const epoch = client.live.epoch.id();

    const userBalance = web3.hook.usePriorityBalance(provider);

    const { type, data } = state.app.select.modalData() as {
        type: ModalTypes;
        data?: { token?: LiveToken; mustPickNuggToBuyFrom: boolean };
    };

    const [stableType, setType] = useState(type);
    const [stableId, setId] = useState(tokenId);

    useEffect(() => {
        if (type) setType(type);
        if (tokenId) setId(tokenId);
    }, [type, tokenId]);

    const _myNuggs = client.live.myNuggs();
    const myNuggs = useMemo(
        () =>
            _myNuggs.map((x) => ({
                ...x,
                unclaimedOffers: x.unclaimedOffers.filter((y) => {
                    return `item-${y.itemId}` === stableId;
                }),
            })),
        [_myNuggs, stableId],
    );
    useEffect(() => {
        if (epoch) {
            const prevBidder = myNuggs.find((nugg) =>
                nugg.unclaimedOffers.find(
                    (offer) =>
                        (offer.endingEpoch ?? 0) === epoch &&
                        offer.itemId === extractItemId(stableId),
                ),
            );

            if (prevBidder) {
                setSelectedNugg(prevBidder);
            }
        }
    }, [myNuggs, epoch, stableId]);

    const activeItem = client.live.activeNuggItem(stableId);

    const sellingNugg = React.useMemo(() => {
        if (data && data.token && data.mustPickNuggToBuyFrom) {
            return selectedSellingNuggForItem?.nugg;
        }
        if (activeItem) return activeItem.sellingNugg;
        return undefined;
    }, [activeItem, data, selectedSellingNuggForItem]);

    const check = useAsyncState<{
        canOffer: boolean | undefined;
        next: BigNumber | undefined;
        curr: BigNumber | undefined;
    }>(() => {
        if (stableId && address && chainId && provider) {
            if (stableType === 'OfferNugg') {
                return new NuggftV1Helper(chainId, provider).contract['check(address,uint160)'](
                    address,
                    stableId,
                ).then((x) => {
                    return {
                        canOffer: x.canOffer,
                        next: x.next,
                        curr: x.current,
                    };
                });
            }
            if (stableType === 'OfferItem' && activeItem && selectedNuggForItem && sellingNugg) {
                return new NuggftV1Helper(chainId, provider).contract[
                    'check(uint160,uint160,uint16)'
                ](selectedNuggForItem.tokenId, sellingNugg, extractItemId(stableId)).then((x) => {
                    return {
                        canOffer: x.canOffer,
                        next: x.next,
                        curr: x.current,
                    };
                });
            }
        }
        return new Promise((resolve) =>
            // eslint-disable-next-line no-promise-executor-return
            resolve({ canOffer: undefined, next: undefined, curr: undefined }),
        );
    }, [
        stableId,
        address,
        chainId,
        provider,
        stableType,
        selectedNuggForItem,
        activeItem,
        sellingNugg,
    ]);
    // const nuggft = useNuggftV1();
    // console.log({ sellingNugg, stableId, selectedNuggForItem });
    // const { send, revert } = useTransactionManager();
    return (
        <div style={styles.container}>
            <Text textStyle={{ color: 'white' }}>
                {`${
                    check && check.curr && check.curr.toString() !== '0'
                        ? 'Change offer for'
                        : 'Offer on'
                } ${parseTokenId(stableId, true)}`}
            </Text>
            <AnimatedCard>
                <TokenViewer
                    tokenId={stableId}
                    showcase
                    style={stableType === 'OfferItem' ? { height: '350px', width: '350px' } : {}}
                />
            </AnimatedCard>
            {data?.token?.type === 'item' && data?.mustPickNuggToBuyFrom && (
                <List
                    data={data?.token.tryout.swaps}
                    label="Pick a nugg to buy this item from"
                    labelStyle={{
                        color: 'white',
                    }}
                    extraData={undefined}
                    RenderItem={React.memo(SellingNuggRenderItem)}
                    horizontal
                    action={(item: TryoutData) => {
                        setSelectedSellingNugg(item);
                    }}
                    selected={selectedSellingNuggForItem}
                    style={{
                        width: '100%',
                        background: Colors.transparentLightGrey,
                        height: '140px',
                        padding: '0rem .4rem',
                        borderRadius: Layout.borderRadius.medium,
                    }}
                />
            )}
            {stableType === 'OfferItem' && (
                <List
                    data={myNuggs}
                    label="Pick a nugg to offer on this item"
                    labelStyle={{
                        color: 'white',
                    }}
                    extraData={undefined}
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
                    shouldFocus
                    style={styles.input}
                    styleHeading={styles.heading}
                    styleInputContainer={styles.inputCurrency}
                    label="Enter amount"
                    setValue={setAmount}
                    value={amount}
                    code
                    className="placeholder-white"
                    rightToggles={[
                        <Button
                            onClick={() => {
                                try {
                                    const next = check && check.next ? fromEth(check.next) : '';
                                    setAmount(next);
                                } catch (err) {
                                    console.error(err);
                                }
                            }}
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
                            {userBalance.decimal.toNumber().toPrecision(5)} ETH
                        </Text>
                    </Text>
                )}
            </div>
            {/* {revert &&
                (revert instanceof lib.errors.RevertError ? (
                    <Label text={revert.message} />
                ) : (
                    <Label text="something unexpected happened" />
                ))} */}
            {check ? (
                <div style={styles.subContainer}>
                    <FeedbackButton
                        overrideFeedback
                        disabled={!check || !check.canOffer || Number(amount) === 0}
                        feedbackText="Check Wallet..."
                        buttonStyle={styles.button}
                        label={`${
                            // eslint-disable-next-line no-nested-ternary
                            check && check.curr && check.curr.toString() !== '0'
                                ? !check.canOffer
                                    ? 'You cannot place an offer'
                                    : 'Update offer'
                                : 'Place offer'
                        }`}
                        // onClick={() => {
                        // if (check.curr && chainId && provider && address) {
                        //     void send(
                        //         nuggft.populateTransaction['offer(uint160)'](tokenId, {
                        //             value: toEth(amount).sub(check.curr),
                        //         }),
                        //     );
                        onClick={() =>
                            check.curr &&
                            chainId &&
                            provider &&
                            address &&
                            WalletState.dispatch.placeOffer({
                                tokenId,
                                amount: fromEth(toEth(amount).sub(check.curr)),
                                chainId,
                                provider,
                                address,
                                buyingTokenId:
                                    stableType === 'OfferItem' && selectedNuggForItem
                                        ? selectedNuggForItem.tokenId
                                        : undefined,
                                sellingTokenId:
                                    stableType === 'OfferItem' && activeItem
                                        ? sellingNugg
                                        : undefined,
                            })
                        }
                        // }}
                    />
                </div>
            ) : null}
        </div>
    );
};

export default OfferModal;
