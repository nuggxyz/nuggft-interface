import React, { FC, useMemo, useState } from 'react';
import { BigNumber } from 'ethers';
import { t } from '@lingui/macro';

import useAsyncState from '@src/hooks/useAsyncState';
import { toGwei } from '@src/lib';
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
import client from '@src/client';
import Colors from '@src/lib/colors';
import List, { ListRenderItemProps } from '@src/components/general/List/List';
import { MyNuggsData } from '@src/client/interfaces';
import Label from '@src/components/general/Label/Label';
import { EthInt } from '@src/classes/Fraction';
import { OfferModalData } from '@src/interfaces/modals';
import useDimentions from '@src/client/hooks/useDimentions';
import { useTransactionManager, useNuggftV1 } from '@src/contracts/useContract';

import styles from './OfferModal.styles';

type FormatedMyNuggsData = MyNuggsData & { lastBid: EthInt | 'unable-to-bid' };

const OfferModal = ({ data }: { data: OfferModalData }) => {
    const address = web3.hook.usePriorityAccount();
    const { screen: screenType } = useDimentions();
    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();
    const _myNuggs = client.live.myNuggs().first(8);
    const userBalance = web3.hook.usePriorityBalance(provider);
    const activeItem = client.live.potentialNuggItem(data.tokenId.onlyItemId());
    const nuggft = useNuggftV1(provider);
    const closeModal = client.modal.useCloseModal();

    const { send } = useTransactionManager();

    const [selectedNuggForItem, setSelectedNugg] = useState<FormatedMyNuggsData>();
    const [amount, setAmount] = useState('');

    const myNuggs = useMemo(() => {
        const nuggId = data.nuggToBuyFrom;

        return _myNuggs.map((x) => {
            const filt = x.unclaimedOffers.filter((y) => {
                return y.itemId === data.tokenId;
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
    }, [_myNuggs, data.tokenId, data.nuggToBuyFrom]);

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

    const sellingNugg = useMemo(() => {
        if (data.tokenId.isItemId()) {
            return data.nuggToBuyFrom;
            // if (activeItem) return activeItem.sellingNugg;
        }
        return undefined;
    }, [data.tokenId, data.nuggToBuyFrom]);

    const check = useAsyncState<{
        canOffer: boolean | undefined;
        next: BigNumber | undefined;
        curr: BigNumber | undefined;
    }>(() => {
        if (data.tokenId && address && chainId && provider) {
            if (data.tokenId.isNuggId()) {
                return nuggft['check(address,uint24)'](address, data.tokenId.toRawId()).then(
                    (x) => {
                        return {
                            canOffer: x.canOffer,
                            next: x.next,
                            curr: x.current,
                        };
                    },
                );
            }
            if (activeItem && selectedNuggForItem && sellingNugg) {
                return nuggft['check(uint24,uint24,uint16)'](
                    selectedNuggForItem.tokenId,
                    sellingNugg,
                    data.tokenId.toRawId(),
                ).then((x) => {
                    return {
                        canOffer: x.canOffer,
                        next: x.next,
                        curr: x.current,
                    };
                });
            }
        }
        return undefined;
    }, [data, address, chainId, provider, selectedNuggForItem, activeItem, sellingNugg]);

    return (
        <div style={styles.container}>
            <Text textStyle={{ color: 'white' }}>
                {`${
                    check && check.curr && check.curr.toString() !== '0'
                        ? t`Change offer for`
                        : t`Offer on`
                } ${data.tokenId.toPrettyId()}`}
            </Text>
            {screenType === 'phone' ? (
                <TokenViewer
                    tokenId={data.tokenId}
                    showcase
                    disableOnClick
                    style={{
                        ...{ height: '150px', width: '150px' },
                    }}
                />
            ) : (
                <AnimatedCard>
                    <TokenViewer
                        tokenId={data.tokenId}
                        showcase
                        style={{
                            ...(data.tokenId.isItemId() ? { height: '350px', width: '350px' } : {}),
                        }}
                    />
                </AnimatedCard>
            )}

            {data.tokenId.isItemId() && (
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
                            disabled={data.tokenId.isItemId() && !selectedNuggForItem}
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
                        onClick={() => {
                            if (check.curr && chainId && provider && address) {
                                if (data.tokenId.isItemId()) {
                                    if (selectedNuggForItem && data.nuggToBuyFrom) {
                                        void send(
                                            nuggft.populateTransaction[
                                                'offer(uint24,uint24,uint16)'
                                            ](
                                                selectedNuggForItem?.tokenId,
                                                data.nuggToBuyFrom?.toRawId(),
                                                data.tokenId,
                                                {
                                                    value: toEth(amount).sub(check.curr),
                                                },
                                            ),
                                            closeModal,
                                        );
                                    }
                                } else {
                                    void send(
                                        nuggft.populateTransaction['offer(uint24)'](data.tokenId, {
                                            value: toEth(amount).sub(check.curr),
                                            gasLimit: toGwei('120000'),
                                        }),
                                        closeModal,
                                    );
                                }
                            }
                        }}
                    />
                </div>
            ) : null}
        </div>
    );
};

const MyNuggRenderItem: FC<
    ListRenderItemProps<FormatedMyNuggsData, undefined, FormatedMyNuggsData>
> = ({ item, selected, action }) => {
    const disabled = React.useMemo(() => {
        if (item.activeSwap) return t`currenlty for sale`;
        if (item.lastBid === 'unable-to-bid') return t`previous claim pending for this item`;
        return undefined;
    }, [item]);

    const { screen: screenType } = useDimentions();

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

export default OfferModal;
