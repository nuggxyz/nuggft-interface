import React, { FC, useMemo, useState } from 'react';
import { BigNumber } from 'ethers';
import { t } from '@lingui/macro';

import useAsyncState from '@src/hooks/useAsyncState';
import lib, { parseItmeIdToNum, toGwei } from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';
import CurrencyInput from '@src/components/general/TextInputs/CurrencyInput/CurrencyInput';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import Layout from '@src/lib/layout';
import web3 from '@src/web3';
import client from '@src/client';
import Colors from '@src/lib/colors';
import List, { ListRenderItemProps } from '@src/components/general/List/List';
import { MyNuggsData } from '@src/client/interfaces';
import Label from '@src/components/general/Label/Label';
import { EthInt } from '@src/classes/Fraction';
import { OfferModalData } from '@src/interfaces/modals';
import useDimentions from '@src/client/hooks/useDimentions';
import { useNuggftV1, useTransactionManager } from '@src/contracts/useContract';
import styles from '@src/components/modals/OfferModal/OfferModal.styles';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import { toEth } from '@src/lib/conversion';
import { gotoDeepLink } from '@src/web3/config';

type FormatedMyNuggsData = MyNuggsData & { lastBid: EthInt | 'unable-to-bid' };

const OfferModal = ({
    data,
    page,
    setPage,
}: {
    data: OfferModalData;
    page: number;
    setPage: (num: number) => void;
}) => {
    const address = web3.hook.usePriorityAccount();
    // const swap = client.swaps.useSwap(data.tokenId);

    const { screen: screenType } = useDimentions();
    const provider = web3.hook.useNetworkProvider();

    const chainId = web3.hook.usePriorityChainId();
    const _myNuggs = client.live.myNuggs();
    const userBalance = web3.hook.usePriorityBalance(provider);

    const nuggft = useNuggftV1(provider);
    const closeModal = client.modal.useCloseModal();

    const { estimate, send } = useTransactionManager();

    const [selectedNuggForItem, setSelectedNugg] = useState<FormatedMyNuggsData>();
    const [amount, setAmount] = useState('0');

    const myNuggs = useMemo(() => {
        if (data.token.isNugg()) return [];
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

    const sellingNugg = useMemo(() => {
        if (data.isItem()) {
            return data.nuggToBuyFrom;
        }
        return undefined;
    }, [data.nuggToBuyFrom]);

    const check = useAsyncState<{
        canOffer: boolean | undefined;
        next: BigNumber | undefined;
        curr: BigNumber | undefined;
        eth: EthInt | undefined;
    }>(() => {
        if (data.tokenId && address && chainId && provider) {
            if (data.isNugg()) {
                return Promise.all([
                    nuggft['check(address,uint24)'](address, data.tokenId.toRawId()).then((x) => {
                        return {
                            canOffer: x.canOffer,
                            next: x.next,
                            curr: x.current,
                        };
                    }),
                    nuggft.msp(),
                    nuggft.agency(data.tokenId.toRawId()),
                ]).then((_data) => {
                    const agency = lib.parse.agency(_data[2]);
                    console.log({ _data });
                    if (agency.eth.eq(0)) agency.eth = new EthInt(_data[1]);
                    return { ..._data[0], ...agency };
                });
            }

            if (selectedNuggForItem && sellingNugg) {
                const item = parseItmeIdToNum(data.tokenId.toRawId());
                return Promise.all([
                    nuggft['check(uint24,uint24,uint16)'](
                        selectedNuggForItem.tokenId.toRawIdNum(),
                        sellingNugg.toRawId(),
                        data.tokenId.toRawId(),
                    ).then((x) => {
                        return {
                            canOffer: x.canOffer,
                            next: x.next,
                            curr: x.current,
                        };
                    }),

                    nuggft.itemAgency(item.feature, item.position),
                ]).then((_data) => {
                    return { ..._data[0], ...lib.parse.agency(_data[1]) };
                });
            }
        }
        return undefined;
    }, [data, address, chainId, provider, selectedNuggForItem, sellingNugg]);

    React.useEffect(() => {
        if (check && check.eth && amount === '0') {
            setAmount(check.eth.increase(BigInt(5)).number.toFixed(5));
        }
    }, [amount, check]);

    const [lastPressed, setLastPressed] = React.useState('5');

    const populatedTransaction = React.useMemo(() => {
        if (data.tokenId.isItemId()) {
            if (selectedNuggForItem && data.nuggToBuyFrom) {
                return nuggft.populateTransaction['offer(uint24,uint24,uint16)'](
                    selectedNuggForItem?.tokenId.toRawId(),
                    data.nuggToBuyFrom?.toRawId(),
                    data.tokenId.toRawId(),
                    {
                        value: toEth(amount).sub(check?.curr || 0),
                    },
                );
            }
        } else {
            return nuggft.populateTransaction['offer(uint24)'](data.tokenId.toRawId(), {
                value: toEth(amount).sub(check?.curr || 0),
                gasLimit: toGwei('120000'),
            });
        }

        return undefined;
    }, [data, nuggft]);

    const estimation = useAsyncState(() => {
        if (populatedTransaction) {
            return Promise.all([estimate(populatedTransaction), provider?.getGasPrice()]).then(
                (_data) => ({
                    gasLimit: _data[0] || BigNumber.from(0),
                    gasPrice: new EthInt(_data[1] || 0),
                    mul: new EthInt((_data[0] || BigNumber.from(0)).mul(_data[1] || 0)),
                }),
            );
        }

        return undefined;
    }, [populatedTransaction]);

    console.log({ estimation, page });

    const IncrementButton = React.useCallback(
        ({ increment }: { increment: bigint }) => {
            return (
                <Button
                    className="mobile-pressable-div"
                    label={`+${increment.toString()}%`}
                    onClick={() => {
                        setAmount(check?.eth?.increase(increment).number.toFixed(5) || '0');
                        setLastPressed(increment.toString());
                    }}
                    buttonStyle={{
                        borderRadius: lib.layout.borderRadius.large,
                        background:
                            lastPressed === increment.toString()
                                ? lib.colors.white
                                : lib.colors.primaryColor,
                        marginRight: '10px',
                    }}
                    textStyle={{
                        color:
                            lastPressed === increment.toString()
                                ? lib.colors.primaryColor
                                : lib.colors.white,
                        fontSize: 24,
                    }}
                    disableHoverAnimation
                />
            );
        },
        [check, lastPressed, amount],
    );
    const peer = web3.hook.usePriorityPeer();

    const Page2 = React.useCallback(() => {
        return (
            <Button
                label="close"
                onClick={closeModal}
                buttonStyle={{
                    borderRadius: lib.layout.borderRadius.large,
                    background: lib.colors.primaryColor,
                    marginTop: '20px',
                }}
                textStyle={{
                    color: lib.colors.white,
                    fontSize: 30,
                }}
            />
        );
    }, []);
    const Page1 = React.useCallback(
        () => (
            <>
                <TokenViewer tokenId={data.tokenId} style={{ width: '150px', height: '150px' }} />
                <Text size="large" textStyle={{ marginTop: 10 }}>
                    Token
                </Text>
                <CurrencyText
                    size="large"
                    stopAnimation
                    showUnit={false}
                    value={0}
                    str={data.tokenId.toPrettyId()}
                />
                <Text size="large" textStyle={{ marginTop: 10 }}>
                    My Current Bid
                </Text>
                <CurrencyText
                    forceEth
                    size="large"
                    stopAnimation
                    value={new EthInt(check?.curr || 0).number}
                />
                <Text size="large" textStyle={{ marginTop: 10 }}>
                    My Desired Bid
                </Text>
                <CurrencyText
                    size="large"
                    stopAnimation
                    value={EthInt.fromEthDecimalString(amount).number}
                />
                <Text size="large" textStyle={{ marginTop: 10 }}>
                    Estimated Gas Fee
                </Text>
                <CurrencyText
                    size="large"
                    stopAnimation
                    value={estimation?.mul.number || 0}
                    forceEth
                />{' '}
                <Text size="large" textStyle={{ marginTop: 10 }}>
                    Payment
                </Text>
                <CurrencyText
                    size="largerish"
                    stopAnimation
                    value={EthInt.fromEthDecimalString(amount).sub(check?.curr || 0).number}
                />
                <Button
                    label="Submit"
                    disabled={!check || !populatedTransaction}
                    onClick={() => {
                        if (populatedTransaction && peer) {
                            void send(populatedTransaction, () => {
                                if (peer.type === 'walletconnect')
                                    gotoDeepLink(peer.deeplink_href || '');
                            });
                            setPage(2);
                        }
                    }}
                    buttonStyle={{
                        borderRadius: lib.layout.borderRadius.large,
                        background: lib.colors.primaryColor,
                        marginTop: '20px',
                    }}
                    textStyle={{
                        color: lib.colors.white,
                        fontSize: 30,
                    }}
                />
            </>
        ),
        [data, check, amount, estimation, setPage],
    );

    const Page0 = React.useCallback(
        () => (
            <>
                {/* <Text size="larger" textStyle={{ marginTop: 10 }}>
                Current Price
            </Text>
            <CurrencyText size="largest" value={swap?.eth.number || 0} /> */}
                <Text size="larger" textStyle={{ marginTop: 10 }}>
                    Current Price
                </Text>

                <CurrencyText forceEth size="larger" value={check?.eth?.number || 0} />

                <Text size="larger" textStyle={{ marginTop: 10 }}>
                    My Balance
                </Text>
                <CurrencyText
                    forceEth
                    size="larger"
                    value={userBalance?.number || 0}
                    stopAnimation
                />

                <Text size="larger" textStyle={{ marginTop: 10 }}>
                    New Bid
                </Text>

                <div style={styles.inputContainer}>
                    <CurrencyInput
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            color: lib.colors.primaryColor,
                        }}
                        styleInput={{
                            fontSize: 32,
                            color: lib.colors.primaryColor,
                            textAlign: 'center',
                        }}
                        // styleHeading={styles.heading}
                        styleInputContainer={{
                            textAlign: 'left',
                            width: '100%',
                            background: Colors.transparentPrimaryColorSuper,
                            padding: '.3rem .6rem',
                            borderRadius: Layout.borderRadius.mediumish,
                        }}
                        // label={t`Enter amount`}
                        setValue={setAmount}
                        value={amount}
                        code
                        className="placeholder-white"
                        // rightToggles={[
                        //     <Button
                        //         onClick={() => {
                        //             try {
                        //                 const next = check && check.next ? fromEth(check.next) : '';
                        //                 setAmount(next);
                        //             } catch (err) {
                        //                 console.error(err);
                        //             }
                        //         }}
                        //         disabled={data.tokenId.isItemId() && !selectedNuggForItem}
                        //         label={t`Min`}
                        //         textStyle={{
                        //             fontFamily: Layout.font.sf.bold,
                        //             fontSize: FontSize.h6,
                        //         }}
                        //         buttonStyle={{
                        //             borderRadius: Layout.borderRadius.large,
                        //             padding: '.2rem .5rem',
                        //         }}
                        //     />,
                        // ]}
                    />
                </div>
                <div
                    style={{
                        display: 'flex',
                        width: '100%',
                        justifyContent: 'flex-start',
                        padding: '10px 0',
                        overflow: 'scroll',
                    }}
                >
                    <IncrementButton increment={BigInt(5)} />
                    <IncrementButton increment={BigInt(10)} />
                    <IncrementButton increment={BigInt(15)} />
                    <IncrementButton increment={BigInt(20)} />
                    <IncrementButton increment={BigInt(25)} />
                    <IncrementButton increment={BigInt(30)} />
                </div>

                <Button
                    label="Review"
                    onClick={() => setPage(1)}
                    disabled={!check}
                    buttonStyle={{
                        borderRadius: lib.layout.borderRadius.large,
                        background: lib.colors.primaryColor,
                        marginTop: '20px',
                    }}
                    textStyle={{
                        color: lib.colors.white,
                        fontSize: 30,
                    }}
                />

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

                {/* <div
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
            </div> */}

                {/* {check ? (
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
                            if (populatedTransaction) {
                                void send(populatedTransaction);
                            }
                        }}
                    />
                </div>
            ) : null} */}
            </>
        ),
        [data, check, amount, estimation, setPage, myNuggs],
    );

    // const Comp = React.useCallback(
    //     (_page) => {
    //         return _page === 0 ? Page0 : Page0;
    //     },
    //     [Page0],
    // );

    return <>{page === 0 ? <Page0 /> : page === 1 ? <Page1 /> : <Page2 />}</>;
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
