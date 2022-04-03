import React, { FC, useEffect, useMemo, useState } from 'react';
import { BigNumber } from 'ethers';
import { t } from '@lingui/macro';

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
import { TokenId, NuggId } from '@src/client/router';
import client from '@src/client';
import Colors from '@src/lib/colors';
import List, { ListRenderItemProps } from '@src/components/general/List/List';
import WalletState from '@src/state/wallet';
import { MyNuggsData, LiveToken } from '@src/client/interfaces';
import Label from '@src/components/general/Label/Label';
import { EthInt } from '@src/classes/Fraction';
import AppState from '@src/state/app';

import styles from './OfferModal.styles';

type FormatedMyNuggsData = MyNuggsData & { lastBid: EthInt | 'unable-to-bid' };

const MyNuggRenderItem: FC<
    ListRenderItemProps<FormatedMyNuggsData, undefined, FormatedMyNuggsData>
> = ({ item, selected, action }) => {
    const disabled = React.useMemo(() => {
        if (item.activeSwap) return t`currenlty for sale`;
        if (item.lastBid === 'unable-to-bid') return t`previous claim pending for this item`;
        return undefined;
    }, [item]);
    const screenType = AppState.select.screenType();

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
                        style={
                            screenType !== 'phone'
                                ? { width: '80px', height: '80px' }
                                : { width: '60px', height: '60px' }
                        }
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

// const SellingNuggRenderItem: FC<ListRenderItemProps<TryoutData, undefined, TryoutData>> = ({
//     item: tryoutData,
//     selected,
//     action,
// }) => {
//     return (
//         <Button
//             buttonStyle={{
//                 background: selected ? Colors.transparentGrey2 : Colors.transparent,
//                 borderRadius: Layout.borderRadius.medium,
//                 transition: '.2s background ease',
//             }}
//             rightIcon={
//                 <div>
//                     <TokenViewer
//                         tokenId={tryoutData.nugg}
//                         style={{ width: '80px', height: '80px' }}
//                         showLabel
//                         disableOnClick
//                     />
//                     <CurrencyText value={tryoutData.eth.decimal.toNumber()} />
//                 </div>
//             }
//             onClick={() => action && action(tryoutData)}
//         />
//     );
// };

type Props = {
    tokenId: TokenId;
};

const OfferModal = ({ tokenId }: Props) => {
    const [amount, setAmount] = useState('');
    const address = web3.hook.usePriorityAccount();

    const [selectedNuggForItem, setSelectedNugg] = useState<FormatedMyNuggsData>();

    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();

    const userBalance = web3.hook.usePriorityBalance(provider);

    const { type, data } = state.app.select.modalData() as {
        type: ModalTypes;
        data?: { token?: LiveToken; nuggToBuyFrom: undefined | NuggId };
    };

    const [stableType, setType] = useState(type);
    const [stableId, setId] = useState(tokenId);

    useEffect(() => {
        if (type) setType(type);
        if (tokenId) setId(tokenId);
    }, [type, tokenId]);

    const _myNuggs = client.live.myNuggs().first(8);
    const myNuggs = useMemo(() => {
        const nuggId = data?.nuggToBuyFrom;

        return _myNuggs.map((x) => {
            const filt = x.unclaimedOffers.filter((y) => {
                return `item-${y.itemId}` === stableId;
            });

            return {
                ...x,
                lastBid:
                    filt.length === 0
                        ? new EthInt(0)
                        : filt[0].sellingNuggId === nuggId
                        ? new EthInt(filt[0]?.eth || 0)
                        : ('unable-to-bid' as const),
            };
        }) as FormatedMyNuggsData[];
    }, [_myNuggs, stableId, data]);

    // @danny7even - this started throwing errors when I tried setting up offering on items when other items were "active"
    // useEffect(() => {
    //     console.log('ME TOOOOOO');
    //     if (epoch) {
    //         const prevBidder = myNuggs.find((nugg) =>
    //             nugg.unclaimedOffers.find(
    //                 (offer) =>
    //                     (offer.endingEpoch ?? 0) === epoch &&
    //                     offer.itemId === extractItemId(stableId),
    //             ),
    //         );

    //         if (prevBidder) {
    //             setSelectedNugg(prevBidder);
    //         }
    //     }
    // }, [myNuggs, epoch, stableId]);

    const activeItem = client.live.potentialNuggItem(stableId);
    const sellingNugg = React.useMemo(() => {
        if (data && data.token && data.nuggToBuyFrom) {
            return data.nuggToBuyFrom;
        }
        if (activeItem) return activeItem.sellingNugg;
        return undefined;
    }, [data, activeItem]);

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
        return undefined;
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
    const screenType = AppState.select.screenType();

    return (
        <div style={styles.container}>
            <Text textStyle={{ color: 'white' }}>
                {`${
                    check && check.curr && check.curr.toString() !== '0'
                        ? t`Change offer for`
                        : t`Offer on`
                } ${parseTokenId(stableId, true)}`}
            </Text>
            {screenType === 'phone' ? (
                <TokenViewer
                    tokenId={stableId}
                    showcase
                    disableOnClick
                    style={{
                        ...{ height: '150px', width: '150px' },
                    }}
                />
            ) : (
                <AnimatedCard>
                    <TokenViewer
                        tokenId={stableId}
                        showcase
                        style={{
                            ...(stableType === 'OfferItem'
                                ? { height: '350px', width: '350px' }
                                : {}),
                        }}
                    />
                </AnimatedCard>
            )}

            {stableType === 'OfferItem' && (
                <List
                    data={myNuggs}
                    label={t`Pick a nugg to offer on this item`}
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
                        height: screenType === 'phone' ? '100px' : '140px',
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
                    label={t`Enter amount`}
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
                            label={t`Min`}
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
                        {t`You currently have`}
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
                        feedbackText={t`Check Wallet...`}
                        buttonStyle={styles.button}
                        label={`${
                            // eslint-disable-next-line no-nested-ternary
                            check && check.curr && check.curr.toString() !== '0'
                                ? !check.canOffer
                                    ? t`You cannot place an offer`
                                    : t`Update offer`
                                : t`Place offer`
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
