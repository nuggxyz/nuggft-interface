/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';
import { animated, config, SpringValue, useSpring, useTransition } from '@react-spring/web';
import { IoChevronBackCircle } from 'react-icons/io5';

import useAsyncState from '@src/hooks/useAsyncState';
import lib from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import web3 from '@src/web3';
import client from '@src/client';
import Label from '@src/components/general/Label/Label';
import { EthInt } from '@src/classes/Fraction';
import { OfferModalData } from '@src/interfaces/modals';
import { useNuggftV1, usePrioritySendTransaction } from '@src/contracts/useContract';
import styles from '@src/components/modals/OfferModal/OfferModal.styles';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import Loader from '@src/components/general/Loader/Loader';
import NLStaticImage from '@src/components/general/NLStaticImage';
import { useUsdPair, useUsdPairWithCalculation } from '@src/client/usd';
import CurrencyToggler, {
    useCurrencyTogglerState,
} from '@src/components/general/Buttons/CurrencyToggler/CurrencyToggler';
import { DualCurrencyInputWithIcon } from '@src/components/general/TextInputs/CurrencyInput/CurrencyInput';
import { calculateRawOfferValue } from '@src/web3/constants';
import TransactionVisualConfirmation from '@src/components/nugg/TransactionVisualConfirmation';
import packages from '@src/packages';
import useAggregatedOffers from '@src/client/hooks/useAggregatedOffers';

const OfferModal = ({ data }: { data: OfferModalData }) => {
    const isOpen = client.modal.useOpen();

    const address = web3.hook.usePriorityAccount();

    const network = web3.hook.useNetworkProvider();
    const chainId = web3.hook.usePriorityChainId();
    const userBalance = web3.hook.usePriorityBalance(network);
    const peer = web3.hook.usePriorityPeer();
    const nuggft = useNuggftV1(network);
    const closeModal = client.modal.useCloseModal();
    const [page, setPage] = client.modal.usePhase();
    const { send, estimation: estimator, hash, error } = usePrioritySendTransaction();
    const [amount, setAmount] = useState('0');

    const [lastPressed, setLastPressed] = React.useState('5' as `${bigint}` | null);

    const msp = client.stake.useMsp();

    const blocknum = client.block.useBlock();

    const check = useAsyncState<{
        canOffer: boolean | undefined;
        next: BigNumber | undefined;
        curr: BigNumber | undefined;
        eth: EthInt | undefined;
        increment: BigNumber | undefined;
        multicallRequired: boolean | undefined;
    }>(() => {
        if (data.tokenId && address && chainId && network && msp) {
            if (data.isNugg()) {
                return Promise.all([
                    nuggft['check(address,uint24)'](address, data.tokenId.toRawId()).then((x) => {
                        return {
                            canOffer: x.canOffer,
                            next: x.next,
                            curr: x.current,
                            increment: x.incrementBps,
                            multicallRequired: false,
                        };
                    }),
                    msp.bignumber,
                    nuggft.agency(data.tokenId.toRawId()),
                ]).then((_data) => {
                    const agency = lib.parse.agency(_data[2]);
                    if (agency.eth.eq(0)) agency.eth = new EthInt(_data[1]);
                    return { ..._data[0], ...agency };
                });
            }

            return Promise.all([
                nuggft['check(uint24,uint24,uint16)'](
                    data.nuggToBuyFor.toRawIdNum(),
                    data.nuggToBuyFrom.toRawId(),
                    data.tokenId.toRawId(),
                ).then((x) => {
                    return {
                        canOffer: x.canOffer,
                        next: x.next,
                        curr: x.current,
                        increment: x.incrementBps,
                    };
                }),

                nuggft.itemAgency(data.nuggToBuyFrom.toRawId(), data.tokenId.toRawId()),
            ])
                .then((_data) => {
                    const agency = lib.parse.agency(_data[1]);
                    if (agency.eth.eq(0)) {
                        return {
                            ..._data[0],
                            eth: EthInt.fromFractionRaw(msp),
                            multicallRequired: true,
                        };
                    }
                    return { ..._data[0], ...agency, multicallRequired: false };
                })
                .catch(() => {
                    return {
                        canOffer: undefined,
                        next: undefined,
                        curr: undefined,
                        increment: undefined,
                        eth: undefined,
                        multicallRequired: false,
                    };
                });
        }
        return undefined;
    }, [address, chainId, network, data.nuggToBuyFor, data.nuggToBuyFrom, msp, blocknum]);

    const minNextBid = React.useMemo(() => {
        if (!check?.next) return 0;
        return Number(new EthInt(check.next).toFixedStringRoundingUp(5));
    }, [check?.next]);

    React.useEffect(() => {
        if (check && check.next && (amount === '0' || lastPressed === null)) {
            setAmount(new EthInt(check.next).toFixedStringRoundingUp(5));
            setLastPressed(null);
        }
    }, [amount, check, lastPressed]);

    const amountUsd = useUsdPair(amount);
    const currentPrice = useUsdPair(check?.eth);
    const myBalance = useUsdPair(userBalance?.number);
    const currentBid = useUsdPair(check?.curr);
    const minNextBidPair = useUsdPair(minNextBid);

    const paymentUsd = useUsdPairWithCalculation(
        React.useMemo(
            () => [amount, check?.curr || 0, check?.multicallRequired ? msp : 0],
            [amount, check, msp],
        ),
        React.useMemo(
            () =>
                ([_amount, _check, _msp]) => {
                    // was running into issue where "value" inside populatedTransaction was negative
                    const copy = _amount.copy();
                    if (copy.gt(0)) return copy.sub(_check).add(_msp);
                    return new EthInt(0);
                },
            [],
        ),
    );

    const populatedTransaction = React.useMemo(() => {
        const value = paymentUsd.eth.bignumber;

        if (!paymentUsd.eth.eq(0)) {
            if (data.isItem()) {
                if (check?.multicallRequired) {
                    const realmsp = msp.increase(BigInt(5));
                    const updatedValue = value.add(realmsp.bignumber);
                    return {
                        tx: nuggft.populateTransaction['offer(uint64[],uint256[])'](
                            [
                                data.nuggToBuyFrom.toRawId(),
                                calculateRawOfferValue(
                                    data.nuggToBuyFor,
                                    data.nuggToBuyFrom,
                                    data.tokenId,
                                ),
                            ],
                            [realmsp.bignumber, value],
                            {
                                value: updatedValue,
                                from: address,
                            },
                        ),
                        amount: value,
                    };
                }
                return {
                    tx: nuggft.populateTransaction['offer(uint24,uint24,uint16)'](
                        data.nuggToBuyFor.toRawId(),
                        data.nuggToBuyFrom.toRawId(),
                        data.tokenId.toRawId(),
                        {
                            value,
                            from: address,
                        },
                    ),
                    amount: value,
                };
            }
            return {
                tx: nuggft.populateTransaction['offer(uint24)'](data.tokenId.toRawId(), {
                    from: address,
                    value,
                    // gasLimit: toGwei('120000'),
                }),
                amount: value,
            };
        }

        return undefined;
    }, [nuggft, paymentUsd, address, data, msp, check?.multicallRequired]);

    const estimation = useAsyncState(() => {
        if (populatedTransaction && network) {
            return Promise.all([
                estimator.estimate(populatedTransaction.tx),
                network?.getGasPrice(),
            ]).then((_data) => ({
                gasLimit: _data[0] || BigNumber.from(0),
                gasPrice: new EthInt(_data[1] || 0),
                mul: new EthInt((_data[0] || BigNumber.from(0)).mul(_data[1] || 0)),
                amount: populatedTransaction.amount,
            }));
        }

        return undefined;
    }, [populatedTransaction, network]);

    // const activeIncrement = React.useMemo(() => {
    //     // if (data.isNugg() && data.)
    //     return web3.config.calculateIncrement(data.endingEpoch ?? undefined, blocknum);
    // }, [blocknum, data.endingEpoch]);

    const increments = React.useMemo(() => {
        const inc = check?.increment ? (check.increment.toNumber() - 10000) / 100 : 5;
        return [
            BigInt(inc),
            ...[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 75, 99]
                .filter((x) => x > inc)
                .map((x) => BigInt(x)),
        ];
    }, [check?.increment]);

    const [transition] = packages.spring.useTransition(increments, () => ({
        leave: {
            width: 0,
        },
        keys: (item) => `increments-${item}`,
    }));

    // eslint-disable-next-line react/require-default-props
    const IncrementButton = React.memo(
        ({
            increment,
            style,
            index,
        }: {
            increment: bigint;
            style: {
                width: SpringValue<number>;
            };
            index: number;
        }) => {
            return (
                <animated.div style={{ ...style }}>
                    <Button
                        className="mobile-pressable-div"
                        label={increment !== BigInt(0) ? `+${increment.toString()}%` : 'min'}
                        onClick={() => {
                            if (Number(index) === 0) {
                                setAmount(minNextBid.toString());
                                setLastPressed(null);
                                return;
                            }
                            const a =
                                check?.eth?.increaseToFixedStringRoundingUp(increment, 5) || '0';
                            setAmount(a);
                            setLastPressed(`${increment}`);
                        }}
                        // disabled={activeIncrement > increment}
                        buttonStyle={{
                            borderRadius: lib.layout.borderRadius.large,
                            background:
                                lastPressed === increment.toString() ||
                                (index === 0 && lastPressed === null)
                                    ? lib.colors.white
                                    : lib.colors.primaryColor,
                            marginRight: '10px',
                        }}
                        textStyle={{
                            color:
                                lastPressed === increment.toString() ||
                                (index === 0 && lastPressed === null)
                                    ? lib.colors.primaryColor
                                    : lib.colors.white,
                            fontSize: 24,
                        }}
                        disableHoverAnimation
                    />
                </animated.div>
            );
        },
    );

    const [tabFadeTransition] = useTransition(
        page,
        {
            initial: {
                transform: 'translate(0px, 0px)',
            },
            from: (p, i) => ({
                transform: p === i ? 'translate(1000px, 0px)' : 'translate(-1000px, 0px)',
            }),
            expires: 500,
            enter: { transform: 'translate(0px, 0px)' },
            leave: (p, i) => {
                return {
                    transform: p === i ? 'translate(-1000px, 0px)' : 'translate(1000px, 0px)',
                };
            },
            keys: (item) => `tabFadeTransition${item}5`,
            config: config.default,
        },
        [page, isOpen],
    );

    const containerStyle = useSpring({
        to: {
            transform: isOpen ? 'scale(1.0)' : 'scale(0.9)',
        },
        config: config.default,
    });

    const calculating = React.useMemo(() => {
        if (estimator.error) return false;
        if (populatedTransaction && estimation) {
            if (populatedTransaction.amount.eq(estimation.amount)) return false;
        }
        return true;
    }, [populatedTransaction, estimation]);

    const globalCurrencyPref = client.usd.useCurrencyPreferrence();

    const [handledNeg1, setHandledNeg1] = React.useState(false);

    React.useEffect(() => {
        if (check?.multicallRequired && !handledNeg1 && page !== -1) {
            setPage(-1);
        }
    }, [check, handledNeg1, page]);

    const mspusd = client.usd.useUsdPair(msp);

    const [localCurrencyPref, setLocalCurrencyPref] = useCurrencyTogglerState(globalCurrencyPref);
    const PageNeg1 = React.useMemo(
        () =>
            !data.isItem() ? null : (
                <>
                    <Text size="larger" textStyle={{ marginTop: 10, textAlign: 'center' }}>
                        one sec
                    </Text>
                    <Text size="medium" textStyle={{ marginTop: 10 }}>
                        <b>{data.nuggToBuyFrom.toPrettyId()}</b> has never been bid on, they must be
                        bid on before they can sell <b>{data.tokenId.toPrettyId()}</b>
                    </Text>

                    <Text size="medium" textStyle={{ marginTop: 10 }}>
                        if you move forward, your transaction will include both a minimum bid on{' '}
                        <b>{data.nuggToBuyFrom.toPrettyId()}</b>, and your desired bid for{' '}
                        <b>{data.tokenId.toPrettyId()}</b>
                    </Text>

                    <Text size="larger" textStyle={{ marginTop: 10 }}>
                        added cost
                    </Text>

                    <CurrencyText
                        unitOverride={localCurrencyPref}
                        forceEth
                        stopAnimation
                        size="larger"
                        value={mspusd}
                    />

                    <Button
                        className="mobile-pressable-div"
                        label="i got it"
                        // leftIcon={calculating ? <Loader /> : undefined}
                        onClick={() => {
                            setHandledNeg1(true);
                            setPage(0);
                        }}
                        // disabled={calculating || !!estimator.error}
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
        [setPage, calculating, localCurrencyPref, data, mspusd],
    );

    const [leader] = useAggregatedOffers(data.tokenId);

    const Page0 = React.useMemo(
        () => (
            <>
                <Text
                    size="larger"
                    textStyle={{ marginTop: 10, fontWeight: lib.layout.fontWeight.thicc }}
                >
                    {leader?.incrementX64 && !leader.incrementX64.isZero()
                        ? 'last bid'
                        : 'asking price'}
                </Text>

                <CurrencyText
                    unitOverride={localCurrencyPref}
                    forceEth
                    stopAnimation
                    size="larger"
                    value={currentPrice}
                />

                <Text
                    size="larger"
                    textStyle={{ marginTop: 10, fontWeight: lib.layout.fontWeight.thicc }}
                >
                    min next bid
                </Text>
                <div>
                    <CurrencyText
                        unitOverride={localCurrencyPref}
                        forceEth
                        size="larger"
                        value={minNextBidPair}
                        stopAnimation
                    />{' '}
                </div>

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
                        ) : estimator.error ? (
                            <Label
                                size="small"
                                containerStyles={{ background: lib.colors.red }}
                                textStyle={{ color: 'white' }}
                                text={lib.errors.prettify('offer-modal', estimator.error)}
                            />
                        ) : null}
                    </div>
                </div>

                <div style={styles.inputContainer}>
                    <DualCurrencyInputWithIcon
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
                            textAlign: 'right',
                            padding: '.3rem .5rem',
                        }}
                        // styleHeading={styles.heading}
                        styleInputContainer={{
                            textAlign: 'left',
                            width: '100%',
                            background: lib.colors.transparentPrimaryColorSuper,
                            padding: '.3rem .6rem',
                            borderRadius: lib.layout.borderRadius.mediumish,
                        }}
                        // label={t`Enter amount`}
                        setValue={setAmount}
                        value={amount}
                        code
                        className="placeholder-white"
                        currencyPref={localCurrencyPref}
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
                    {transition((sty, val, _, ind) => (
                        <IncrementButton increment={val} style={sty} index={ind} />
                    ))}
                </div>

                {check?.multicallRequired && (
                    <Text>
                        <CurrencyText
                            prefix="+"
                            unitOverride={localCurrencyPref}
                            forceEth
                            size="larger"
                            value={mspusd}
                            stopAnimation
                        />
                        for bid on {data.nuggToBuyFrom?.toPrettyId()}
                    </Text>
                )}

                <Button
                    className="mobile-pressable-div"
                    label="review"
                    // leftIcon={calculating ? <Loader /> : undefined}
                    onClick={() => {
                        setPage(1);
                    }}
                    disabled={calculating || !!estimator.error}
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
        [
            mspusd,
            amount,
            setPage,
            calculating,
            localCurrencyPref,
            IncrementButton,
            currentPrice,
            estimator.error,
            myBalance,
            check?.multicallRequired,
            data.nuggToBuyFrom,
        ],
    );
    const Page1 = React.useMemo(
        () =>
            isOpen && peer ? (
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
                    {currentBid.eth.number !== 0 && (
                        <>
                            <Text size="large" textStyle={{ marginTop: 10 }}>
                                My Current Bid
                            </Text>
                            <CurrencyText
                                unitOverride={localCurrencyPref}
                                forceEth
                                size="large"
                                stopAnimation
                                value={currentBid}
                            />
                        </>
                    )}

                    <Text size="large" textStyle={{ marginTop: 10 }}>
                        My Desired Bid
                    </Text>
                    <CurrencyText
                        unitOverride={localCurrencyPref}
                        forceEth
                        size="large"
                        stopAnimation
                        value={amountUsd}
                    />
                    {check?.multicallRequired && (
                        <>
                            <Text size="large" textStyle={{ marginTop: 10 }}>
                                Bid on {data.nuggToBuyFrom?.toPrettyId()}
                            </Text>
                            <CurrencyText
                                unitOverride={localCurrencyPref}
                                forceEth
                                size="large"
                                stopAnimation
                                value={mspusd}
                            />
                        </>
                    )}

                    <Text size="large" textStyle={{ marginTop: 10 }}>
                        Payment
                    </Text>
                    <CurrencyText
                        unitOverride={localCurrencyPref}
                        forceEth
                        size="large"
                        stopAnimation
                        value={paymentUsd}
                    />

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            justifyContent: 'center',
                            marginTop: '20px',
                        }}
                    >
                        <Button
                            className="mobile-pressable-div"
                            // @ts-ignore
                            buttonStyle={{
                                background: lib.colors.primaryColor,
                                color: 'white',
                                borderRadius: lib.layout.borderRadius.medium,
                                boxShadow: lib.layout.boxShadow.basic,
                                width: 'auto',
                            }}
                            hoverStyle={{ filter: 'brightness(1)' }}
                            disabled={!peer}
                            onClick={(event) => {
                                if (!peer || !populatedTransaction) return;

                                if (peer.type === 'metamask' && peer.injected) {
                                    void send(populatedTransaction.tx, () => {
                                        setPage(2);
                                    });
                                } else if ('deeplink_href' in peer) {
                                    event.preventDefault();
                                    event.stopPropagation();

                                    if (populatedTransaction && peer) {
                                        void send(populatedTransaction.tx, () => {
                                            setPage(2);
                                            window.open(peer.deeplink_href || '');
                                        });
                                    }
                                } else {
                                    void send(populatedTransaction.tx, () => {
                                        setPage(2);
                                    });
                                }
                            }}
                            // label="open"
                            size="largerish"
                            textStyle={{ color: lib.colors.white, marginLeft: 10 }}
                            leftIcon={<NLStaticImage image={`${peer.peer}_icon`} />}
                            rightIcon={
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'left',
                                        flexDirection: 'column',
                                        // width: '100%',
                                        marginLeft: 10,
                                    }}
                                >
                                    <Text textStyle={{ color: lib.colors.white, fontSize: 20 }}>
                                        tap to finalize on
                                    </Text>
                                    <Text
                                        textStyle={{
                                            color: lib.colors.white,
                                            fontSize: 32,
                                        }}
                                    >
                                        {peer.name}
                                    </Text>
                                </div>
                            }
                        />
                    </div>
                </>
            ) : null,
        [
            amountUsd,
            paymentUsd,
            setPage,
            isOpen,
            send,
            populatedTransaction,
            peer,
            currentBid,
            data.tokenId,
            data.nuggToBuyFrom,
            mspusd,
            check?.multicallRequired,
            localCurrencyPref,
        ],
    );

    // console.log(transaction);

    const Page2 = React.useMemo(() => {
        return isOpen && chainId && address ? (
            <>
                <TransactionVisualConfirmation
                    hash={hash}
                    onDismiss={closeModal}
                    tokenId={data.tokenId}
                    error={error}
                />
            </>
        ) : null;
    }, [isOpen, closeModal, chainId, data.tokenId, hash, address, error]);

    // const Page2 = React.useMemo(() => {
    //     return isOpen ? (
    //         <TransactionVisualConfirmation
    //             hash={hash}
    //             tokenId={data.tokenId}
    //             onDismiss={() => {
    //                 closeModal();
    //                 startTransition(() => {
    //                     setTimeout(() => {
    //                         setPage(0);
    //                     }, 2000);
    //                 });
    //             }}
    //         />
    //     ) : null;
    // }, [isOpen, closeModal, setPage, data.tokenId, hash]);

    return (
        <>
            {tabFadeTransition((sty, pager) => {
                return (
                    <animated.div
                        style={{
                            // position: 'relative',
                            position: 'absolute',
                            display: 'flex',
                            justifyContent: 'center',
                            width: '100%',
                            margin: 20,
                        }}
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
                                boxShadow: lib.layout.boxShadow.basic,
                                margin: '0rem',
                                justifyContent: 'flex-start',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                ...containerStyle,
                                ...sty,
                                // transform: `translate(var(--${pager}-dumb)px, 0px)`,
                            }}
                        >
                            <>
                                {pager === -1
                                    ? PageNeg1
                                    : pager === 0
                                    ? Page0
                                    : pager === 1
                                    ? Page1
                                    : Page2}
                            </>{' '}
                            {(pager === 1 || pager === 0) && (
                                <>
                                    <Button
                                        className="mobile-pressable-div"
                                        size="small"
                                        buttonStyle={{
                                            position: 'absolute',
                                            left: 3,
                                            bottom: -50,
                                            borderRadius: lib.layout.borderRadius.mediumish,
                                            background: lib.colors.transparentWhite,
                                            WebkitBackdropFilter: 'blur(30px)',
                                            backdropFilter: 'blur(30px)',
                                            boxShadow: lib.layout.boxShadow.basic,
                                        }}
                                        leftIcon={
                                            <IoChevronBackCircle
                                                size={24}
                                                color={lib.colors.primaryColor}
                                                style={{
                                                    marginRight: 5,
                                                    marginLeft: -5,
                                                }}
                                            />
                                        }
                                        textStyle={{
                                            color: lib.colors.primaryColor,
                                            fontSize: 18,
                                        }}
                                        label="go back"
                                        onClick={() => (pager === 0 ? closeModal() : setPage(0))}
                                    />{' '}
                                    <CurrencyToggler
                                        pref={localCurrencyPref}
                                        setPref={setLocalCurrencyPref}
                                        containerStyle={{
                                            position: 'absolute',
                                            right: 3,
                                            bottom: -45,
                                        }}
                                        floaterStyle={{
                                            background: lib.colors.transparentWhite,
                                            boxShadow: lib.layout.boxShadow.basic,
                                        }}
                                    />
                                </>
                            )}
                        </animated.div>
                    </animated.div>
                );
            })}
        </>
    );
};

export default OfferModal;
