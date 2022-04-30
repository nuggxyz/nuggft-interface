import React, { FC, startTransition, useMemo, useState } from 'react';
import { BigNumber } from 'ethers';
import { t } from '@lingui/macro';
import { animated, config, useSpring, useTransition } from '@react-spring/web';

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
import Loader from '@src/components/general/Loader/Loader';
import useMountLogger from '@src/hooks/useMountLogger';
import { gotoDeepLink } from '@src/web3/config';
import NLStaticImage from '@src/components/general/NLStaticImage';
import emitter from '@src/emitter';

// eslint-disable-next-line import/no-cycle

type FormatedMyNuggsData = MyNuggsData & { lastBid: EthInt | 'unable-to-bid' };

const OfferModal = ({ data }: { data: OfferModalData }) => {
    const [page, setPage] = React.useState(0);

    const isOpen = client.modal.useOpen();

    useMountLogger('OfferModal');
    const address = web3.hook.usePriorityAccount();
    // const swap = client.swaps.useSwap(data.tokenId);

    const { screen: screenType } = useDimentions();
    const provider = web3.hook.useNetworkProvider();

    const chainId = web3.hook.usePriorityChainId();
    const _myNuggs = client.live.myNuggs();
    const userBalance = web3.hook.usePriorityBalance(provider);

    const nuggft = useNuggftV1(provider);
    const closeModal = client.modal.useCloseModal();

    const {
        estimate,
        send,
        response,
        receipt: autoReceipt,
        estimateRevert,
    } = useTransactionManager();

    const [selectedNuggForItem, setSelectedNugg] = useState<FormatedMyNuggsData>();
    const [amount, setAmount] = useState('0');

    const [manualOk, setManualOk] = React.useState(false);

    const myNuggs = useMemo(() => {
        console.log('mynugggs');

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
    }, []);

    const sellingNugg = useMemo(() => {
        if (data.isItem()) {
            return data.nuggToBuyFrom;
        }
        return undefined;
    }, []);

    const check = useAsyncState<{
        canOffer: boolean | undefined;
        next: BigNumber | undefined;
        curr: BigNumber | undefined;
        eth: EthInt | undefined;
    }>(() => {
        console.log('check');
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
    }, [address, chainId, provider, selectedNuggForItem, sellingNugg]);

    React.useEffect(() => {
        if (check && check.eth && amount === '0') {
            setAmount(check.eth.increase(BigInt(5)).number.toFixed(5));
        }
    }, [amount, check]);

    const [lastPressed, setLastPressed] = React.useState('5');

    const populatedTransaction = React.useMemo(() => {
        if (!EthInt.fromEthDecimalString(amount).eq(0)) {
            if (data.tokenId.isItemId()) {
                if (selectedNuggForItem && data.nuggToBuyFrom) {
                    return {
                        tx: nuggft.populateTransaction['offer(uint24,uint24,uint16)'](
                            selectedNuggForItem?.tokenId.toRawId(),
                            data.nuggToBuyFrom?.toRawId(),
                            data.tokenId.toRawId(),
                            {
                                value: toEth(amount).sub(check?.curr || 0),
                                from: address,
                            },
                        ),
                        amount: toEth(amount)
                            .sub(check?.curr || 0)
                            .add(1),
                    };
                }
            } else {
                return {
                    tx: nuggft.populateTransaction['offer(uint24)'](data.tokenId.toRawId(), {
                        from: address,
                        value: toEth(amount).sub(check?.curr || 0),
                        gasLimit: toGwei('120000'),
                    }),
                    amount: toEth(amount)
                        .sub(check?.curr || 0)
                        .add(1),
                };
            }
        }

        return undefined;
    }, [nuggft, amount, address, check?.curr, selectedNuggForItem]);

    const estimation = useAsyncState(() => {
        if (populatedTransaction && provider) {
            return Promise.all([estimate(populatedTransaction.tx), provider?.getGasPrice()]).then(
                (_data) => ({
                    gasLimit: _data[0] || BigNumber.from(0),
                    gasPrice: new EthInt(_data[1] || 0),
                    mul: new EthInt((_data[0] || BigNumber.from(0)).mul(_data[1] || 0)),
                    amount: populatedTransaction.amount,
                }),
            );
        }

        return undefined;
    }, [populatedTransaction, provider]);

    const IncrementButton = React.memo(({ increment }: { increment: bigint }) => {
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
    });

    const [manualReceipt, setManualReceipt] = React.useState<TransactionReceipt>();

    const receipt = React.useMemo(() => {
        return autoReceipt ?? manualReceipt;
    }, [autoReceipt, manualReceipt]);

    emitter.on({
        type: emitter.events.TransactionComplete,
        callback: React.useCallback(
            async (input) => {
                if (provider && input.from === address) {
                    setManualReceipt(await provider.getTransactionReceipt(input.txhash));
                }
            },
            [address, provider, setManualReceipt],
        ),
    });

    const peer = web3.hook.usePriorityPeer();

    const [tabFadeTransition] = useTransition(
        page,
        {
            initial: {
                opacity: 0,
                zIndex: 0,
                left: 0,
            },
            from: (p, i) => ({
                opacity: 0,
                zIndex: 0,
                left: p === i ? 1000 : -1000,
            }),
            enter: { opacity: 1, left: 0, right: 0, pointerEvents: 'auto', zIndex: 40000 },
            leave: (p, i) => {
                return {
                    opacity: 0,
                    zIndex: 0,
                    left: p === i ? -1000 : 1000,
                };
            },

            keys: (item) => `tabFadeTransition${item}5`,
            config: config.gentle,
            // cancel: !isOpen,
            // reset: !isOpen,
        },
        [page, isOpen],
    );

    const Page2 = React.useMemo(() => {
        return isOpen ? (
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <AnimatedConfirmation confirmed={!!receipt} />

                {!response && !manualOk && (
                    <div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
                        <Text>Request sent to {peer?.name}</Text>
                        <Text>Waiting on response...</Text>
                        <div
                            style={{
                                display: 'flex',
                                width: '100%',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            {peer?.type === 'walletconnect' && (
                                <Button
                                    buttonStyle={{
                                        background: 'white',
                                        color: 'white',
                                        borderRadius: lib.layout.borderRadius.large,
                                    }}
                                    hoverStyle={{ filter: 'brightness(1)' }}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        gotoDeepLink(peer?.deeplink_href || '');
                                    }}
                                    label="open"
                                    size="largerish"
                                    textStyle={{ color: lib.colors.primaryColor, marginLeft: 10 }}
                                    leftIcon={<NLStaticImage image={`${peer.peer}_icon_small`} />}
                                />
                            )}
                            <Button
                                label="ok, it's done"
                                size="largerish"
                                onClick={() => setManualOk(true)}
                                buttonStyle={{
                                    borderRadius: lib.layout.borderRadius.large,
                                    background: lib.colors.primaryColor,
                                }}
                                textStyle={{
                                    color: lib.colors.white,
                                }}
                            />
                        </div>
                    </div>
                )}

                {!response && manualOk && (
                    <div
                        style={{
                            display: 'flex',
                            width: '100%',
                            flexDirection: 'column',
                            background: 'white',
                            borderRadius: lib.layout.borderRadius.medium,
                            padding: 10,
                            alignItems: 'center',
                        }}
                    >
                        <Text size="small">{`Didn't hear from ${peer?.name || ''}...`}</Text>
                        <Text size="small">Watching for your transaction</Text>
                    </div>
                )}

                <Button
                    label="close"
                    onClick={() => {
                        closeModal();

                        startTransition(() => {
                            setTimeout(() => {
                                setPage(0);
                            }, 2000);
                        });
                    }}
                    buttonStyle={{
                        borderRadius: lib.layout.borderRadius.large,
                        background: lib.colors.primaryColor,
                        marginTop: '20px',
                        width: '100%',
                    }}
                    textStyle={{
                        color: lib.colors.white,
                        fontSize: 30,
                    }}
                />
            </div>
        ) : null;
    }, [response, receipt, manualOk, isOpen, closeModal, setPage, startTransition, peer]);

    const Page1 = React.useMemo(
        () =>
            isOpen ? (
                <>
                    {/* <StupidMfingHack /> */}
                    <TokenViewer
                        tokenId={data.tokenId}
                        style={{ width: '150px', height: '150px' }}
                    />
                    <Text size="large" textStyle={{ marginTop: 10 }}>
                        Token
                    </Text>
                    <CurrencyText
                        size="large"
                        stopAnimation
                        showUnit={false}
                        value={0}
                        str={`${data.tokenId.toPrettyId()} [ERC 721]`}
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
                        value={
                            EthInt.fromEthDecimalString(amount)
                                .sub(new EthInt(check?.curr || 0))
                                .add(estimation?.mul || 0).number
                        }
                    />
                    <Button
                        label="Lets go"
                        disabled={!check || !populatedTransaction}
                        onClick={() => {
                            if (populatedTransaction && peer) {
                                void send(populatedTransaction.tx, undefined, undefined, () => {
                                    setPage(2);
                                    // if (peer.type === 'walletconnect')
                                    //     gotoDeepLink(peer.deeplink_href || '');
                                    // console.log({ res, peer });
                                });
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
            ) : null,
        [check, amount, estimation, setPage, isOpen],
    );

    const calculating = React.useMemo(() => {
        if (populatedTransaction && estimation) {
            if (populatedTransaction.amount.eq(estimation.amount)) return false;
        }
        return true;
    }, [populatedTransaction, estimation]);

    const Page0 = React.useMemo(
        () => (
            <>
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
                <div
                    style={{
                        display: 'flex',
                        width: '100%',
                        justifyContent: 'space-between',
                        marginTop: 10,
                    }}
                >
                    <Text size="larger">New Bid</Text>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        {calculating ? (
                            <Loader style={{ color: lib.colors.primaryColor }} />
                        ) : estimateRevert ? (
                            <Label
                                size="small"
                                containerStyles={{ background: lib.colors.red }}
                                textStyle={{ color: 'white' }}
                                text={lib.errors.prettify('offer-modal', estimateRevert)}
                            />
                        ) : null}
                    </div>
                </div>

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
                    // leftIcon={calculating ? <Loader /> : undefined}
                    onClick={() => setPage(1)}
                    disabled={calculating || !!estimateRevert}
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

                <Button
                    size="small"
                    buttonStyle={{ background: 'transparent' }}
                    label="cancel"
                    onClick={closeModal}
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
            </>
        ),
        [check, amount, estimation, setPage, estimateRevert, calculating],
    );

    const containerStyle = useSpring({
        to: {
            transform: isOpen ? 'scale(1.0)' : 'scale(0.9)',
        },
        config: config.default,
    });

    return (
        <>
            {tabFadeTransition((sty, pager) => (
                <animated.div
                    style={{
                        // position: 'relative',
                        position: 'absolute',
                        display: 'flex',
                        justifyContent: 'center',
                        width: '100%',
                        margin: 20,
                        overflow: 'hidden',
                    }}
                    // ref={node}
                >
                    <animated.div
                        style={{
                            width: '93%',
                            padding: '25px',
                            position: 'relative',
                            // pointerEvents: 'none',
                            // ...sty,
                            background: lib.colors.transparentWhite,
                            transition: `.2s all ${lib.layout.animation}`,

                            borderRadius: lib.layout.borderRadius.largish,

                            margin: '0rem',
                            justifyContent: 'flex-start',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            ...containerStyle,
                            overflow: 'hidden',
                            ...sty,
                        }}
                    >
                        <>{pager === 0 ? Page0 : pager === 1 ? Page1 : Page2}</>{' '}
                    </animated.div>
                </animated.div>
            ))}
        </>
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

export const AnimatedConfirmation = ({ confirmed }: { confirmed: boolean }) => {
    return (
        <div style={{ height: '90px', width: '90px' }}>
            {!confirmed ? (
                <Loader diameter="90px" color={lib.colors.primaryColor} />
            ) : (
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                    <circle
                        className="path circle"
                        fill="none"
                        stroke={lib.colors.green}
                        strokeWidth="6"
                        strokeMiterlimit="10"
                        cx="65.1"
                        cy="65.1"
                        r="62.1"
                        style={{
                            strokeDasharray: 1000,
                            strokeDashoffset: 0,
                            WebkitAnimation: `Dash 0.9s ease-in-out`,
                            animation: `Dash 0.9s ease-in-out`,
                        }}
                    />
                    <polyline
                        className="path check"
                        fill="none"
                        stroke={lib.colors.green}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeMiterlimit="10"
                        points="100.2,40.2 51.5,88.8 29.8,67.5 "
                        style={{
                            strokeDasharray: 1000,
                            // strokeDashoffset: 0,
                            strokeDashoffset: -100,
                            WebkitAnimation: `DashChecked 0.9s 0.35s ease-in-out forwards`,
                            animation: `DashChecked 0.9s 0.35s ease-in-out forwards`,
                        }}
                    />
                </svg>
            )}
        </div>
    );
};
