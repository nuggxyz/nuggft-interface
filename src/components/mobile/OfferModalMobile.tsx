/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';
import { animated, config, useSpring, useTransition } from '@react-spring/web';
import { IoChevronBackCircle } from 'react-icons/io5';
import { t } from '@lingui/macro';

import lib from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import web3 from '@src/web3';
import client from '@src/client';
import Label from '@src/components/general/Label/Label';
import { EthInt, Fraction } from '@src/classes/Fraction';
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
import TransactionVisualConfirmation from '@src/components/nugg/TransactionVisualConfirmation';
import packages from '@src/packages';
import useAggregatedOffers from '@src/client/hooks/useAggregatedOffers';
import CircleTimerMobileCSS2 from '@src/components/general/AnimatedTimers/CircleTimer/CircleTimerMobileCSS2';
import { calculateIncrementWithRemaining } from '@src/web3/config';
import { useMemoizedAsyncState } from '@src/hooks/useAsyncState';

const incrementers = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 75, 99] as const;

const Butter = ({
    currIncrement,
    toggled,
    increment,
    endingEpoch,
    onClick,
    hasNoBids,
}: {
    currIncrement: bigint;
    increment: bigint;
    endingEpoch: number;
    toggled: boolean;
    hasNoBids: boolean;
    onClick: (increment: bigint) => void;
}) => {
    const blocknum = client.block.useBlock();

    const activated = React.useMemo(() => {
        return increment === currIncrement;
    }, [increment, currIncrement]);

    const [secsTillNextInterval, intervalLastsForSecs] = React.useMemo(() => {
        if (activated) {
            const checke = calculateIncrementWithRemaining(endingEpoch, blocknum, hasNoBids);
            return [checke[1], checke[2]];
        }
        return [1, 1];
    }, [blocknum, endingEpoch, activated, hasNoBids]);

    return (
        <div
            role="button"
            aria-hidden="true"
            className="mobile-pressable-div"
            onClick={() => onClick(increment)}
            style={{
                overflow: 'visible',
                height: 50,
                width: 80,
                position: 'relative',
            }}
        >
            <CircleTimerMobileCSS2
                duration={activated ? intervalLastsForSecs : 1}
                remaining={activated ? secsTillNextInterval : 1}
                width={200}
                interval={12}
                toggled={toggled}
                isStatic={!activated}
                strokeWidth={4}
                style={{
                    pointerEvents: 'none',
                    position: 'relative',
                    justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex',
                    width: 50,
                    height: 50,
                    top: 0,
                }}
            >
                <Text
                    textStyle={{
                        color: toggled ? lib.colors.primaryColor : lib.colors.white,
                        padding: '5px',
                        fontWeight: lib.layout.fontWeight.semibold,
                        marginTop: -4,
                        fontSize: 17,
                    }}
                >
                    +{new Fraction(increment, 100).percentString(0)}
                </Text>
            </CircleTimerMobileCSS2>
        </div>
    );
};

const OfferModal = ({ data }: { data: OfferModalData }) => {
    const isOpen = client.modal.useOpen();

    const address = web3.hook.usePriorityAccount();

    const network = web3.hook.useNetworkProvider();
    const chainId = web3.hook.usePriorityChainId();
    const [leader] = useAggregatedOffers(data.tokenId);

    const peer = web3.hook.usePriorityPeer();
    const nuggft = useNuggftV1(network);
    const closeModal = client.modal.useCloseModal();
    const [page, setPage] = client.modal.usePhase();
    const { send, estimation: estimator, hash, error } = usePrioritySendTransaction();
    const [amount, setAmount] = useState('0');

    const [lastPressed, setLastPressed] = React.useState('5' as `${bigint}` | null);

    const msp = client.stake.useMsp();

    const blocknum = client.block.useBlock();

    const check = useMemoizedAsyncState(
        () => {
            if (data.tokenId && address && chainId && network && msp) {
                if (data.isNugg()) {
                    return nuggft['check(address,uint24)'](address, data.tokenId.toRawIdNum()).then(
                        (x) => {
                            return {
                                canOffer: x.canOffer,
                                nextUserOffer: x.next,
                                currentUserOffer: x.currentUserOffer,
                                increment: x.incrementBps,
                                currentLeaderOffer: x.currentLeaderOffer,
                                mustClaimBuyer: false,
                                mustOfferOnSeller: false,
                            };
                        },
                    );
                }

                return nuggft['check(uint24,uint24,uint16)'](
                    data.nuggToBuyFor.toRawIdNum(),
                    data.nuggToBuyFrom.toRawId(),
                    data.tokenId.toRawId(),
                ).then((x) => {
                    return {
                        canOffer: x.canOffer,
                        nextUserOffer: x.next,
                        currentUserOffer: x.currentUserOffer,
                        currentLeaderOffer: x.currentLeaderOffer,
                        increment: x.incrementBps,
                        mustClaimBuyer: x.mustClaimBuyer,
                        mustOfferOnSeller: x.mustOfferOnSeller,
                    };
                });
            }
            return undefined;
        },
        [
            address,
            chainId,
            network,
            data.nuggToBuyFor,
            data.nuggToBuyFrom,
            msp,
            blocknum,
            data.tokenId,
        ] as const,
        (prev, curr, res) => {
            return res !== null && res !== undefined && prev[7] === curr[7];
        },
    );

    const swap = client.swaps.useSwap('nugg-44');
    const epoch = client.epoch.active.useId();

    const noBids = React.useMemo(() => {
        return data.tokenId.toRawIdNum() === epoch && swap?.leader === undefined;
    }, [epoch, swap, data.tokenId]);

    const minNextBid = React.useMemo(() => {
        if (!check?.nextUserOffer) return 0;
        return Number(new EthInt(check.nextUserOffer).toFixedStringRoundingUp(5));
    }, [check?.nextUserOffer]);

    React.useEffect(() => {
        if (check && check.nextUserOffer && (amount === '0' || lastPressed === null)) {
            setAmount(new EthInt(check.nextUserOffer).toFixedStringRoundingUp(5));
            if (lastPressed !== null) setLastPressed(null);
        }
    }, [amount, check, lastPressed]);

    const amountUsd = useUsdPair(amount);
    const currentPrice = useUsdPair(check?.currentLeaderOffer);

    const currentBid = useUsdPair(check?.currentUserOffer);
    const minNextBidPair = useUsdPair(minNextBid);

    const paymentUsd = useUsdPairWithCalculation(
        React.useMemo(
            () => [
                amount,
                check?.currentUserOffer || 0,
                check?.mustOfferOnSeller ? msp.increase(BigInt(5)) : 0,
            ],
            [amount, check, msp],
        ),
        React.useMemo(
            () =>
                ([_amount, _check, _msp]) => {
                    // was running into issue where "value" inside populatedTransaction was negative
                    const copy = _amount.copy();
                    if (copy.gt(0)) {
                        return copy.sub(_check).add(_msp);
                    }
                    return new EthInt(0);
                },
            [],
        ),
    );

    const rawPopulatedTransaction = React.useMemo(() => {
        const value = paymentUsd.eth.bignumber;

        if (!paymentUsd.eth.eq(0)) {
            if (data.isItem()) {
                if (check?.mustClaimBuyer || check?.mustOfferOnSeller) {
                    const realmsp = msp.increase(BigInt(5));
                    return {
                        tx: nuggft.populateTransaction['offer(uint24,uint24,uint16,uint96,uint96)'](
                            data.nuggToBuyFor.toRawId(),
                            data.nuggToBuyFrom.toRawId(),
                            data.tokenId.toRawId(),
                            check?.mustOfferOnSeller ? realmsp.bignumber : BigNumber.from(0),
                            amountUsd.eth.bignumber,
                            {
                                value,
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
                }),
                amount: value,
            };
        }

        return undefined;
    }, [nuggft, paymentUsd, address, data, msp, check, amountUsd]);

    const populatedTransaction = React.useDeferredValue(rawPopulatedTransaction);

    const estimation = useMemoizedAsyncState(
        () => {
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
        },
        [populatedTransaction, network, epoch] as const,
        (prev, curr) => {
            return (
                (prev[2] !== curr[2] ||
                    (prev[0] && curr[0] && prev[0].amount.eq(curr[0].amount))) ??
                false
            );
        },
    );

    const increments = React.useMemo(() => {
        const [inc] = calculateIncrementWithRemaining(data.endingEpoch, blocknum, !leader);

        // const inc = check?.increment ? (check.increment.toNumber() - 10000) / 100 : 5;
        return [BigInt(inc), ...incrementers.filter((x) => x > inc).map((x) => BigInt(x))];
    }, [data.endingEpoch, blocknum, leader]);

    const [shifter] = packages.spring.useSpring(
        () => ({
            to: {
                translateX: (incrementers.length - increments.length) * -80,
            },
        }),
        [increments],
    );

    const butcaller = React.useCallback(
        (increment: bigint) => {
            if (increment === increments[0]) {
                setAmount(minNextBid.toString());
                setLastPressed(null);
                return;
            }
            const a =
                (check?.currentLeaderOffer &&
                    new EthInt(check.currentLeaderOffer).increaseToFixedStringRoundingUp(
                        increment,
                        5,
                    )) ||
                '0';
            setAmount(a);
            setLastPressed(`${increment}`);
        },
        [increments, check?.currentLeaderOffer, minNextBid],
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
    }, [populatedTransaction, estimation, estimator.error]);

    const globalCurrencyPref = client.usd.useCurrencyPreferrence();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [handledNeg1, setHandledNeg1] = React.useState(false);

    React.useEffect(() => {
        if (check?.mustOfferOnSeller && !handledNeg1 && page !== -1) {
            setPage(-1);
        }
    }, [check?.mustOfferOnSeller, handledNeg1, page, setPage]);

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
                        <b>{data.nuggToBuyFrom.toPrettyId()}</b>{' '}
                        {t`has never been bid on, they must be bid on before they can sell`}{' '}
                        <b>{data.tokenId.toPrettyId()}</b>
                    </Text>

                    <Text size="medium" textStyle={{ marginTop: 10 }}>
                        {t`if you move forward, your transaction will include both a minimum bid on`}{' '}
                        <b>{data.nuggToBuyFrom.toPrettyId()}</b>
                        {t`, and your desired bid for`} <b>{data.tokenId.toPrettyId()}</b>
                    </Text>

                    <Text size="larger" textStyle={{ marginTop: 10 }}>
                        {t`added cost`}
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
                        label={t`i got it`}
                        onClick={() => {
                            setHandledNeg1(true);
                            setPage(0);
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
        [setPage, localCurrencyPref, data, mspusd],
    );

    const Page0 = React.useMemo(
        () => (
            <>
                <Text
                    size="larger"
                    textStyle={{ marginTop: 10, fontWeight: lib.layout.fontWeight.thicc }}
                >
                    {leader?.incrementX64 && !leader.incrementX64.isZero()
                        ? t`last bid`
                        : t`asking price`}
                </Text>

                <CurrencyText
                    unitOverride={localCurrencyPref}
                    forceEth
                    size="larger"
                    value={currentPrice}
                />

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text
                            size="larger"
                            textStyle={{ marginTop: 10, fontWeight: lib.layout.fontWeight.thicc }}
                        >
                            {t`min next bid`}
                        </Text>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-start',
                                alignItems: 'center',
                                position: 'relative',
                            }}
                        >
                            <CurrencyText
                                unitOverride={localCurrencyPref}
                                forceEth
                                size="larger"
                                value={minNextBidPair}
                            />
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        width: '100%',
                        justifyContent: 'space-between',
                        marginTop: 10,
                    }}
                >
                    <Text size="larger" textStyle={{ fontWeight: lib.layout.fontWeight.thicc }}>
                        {t`new bid`}
                    </Text>
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
                        styleInputContainer={{
                            textAlign: 'left',
                            width: '100%',
                            background: lib.colors.transparentPrimaryColorSuper,
                            padding: '.3rem .6rem',
                            borderRadius: lib.layout.borderRadius.mediumish,
                        }}
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
                        padding: '20px 10px 10px 10px',
                        overflowX: 'scroll',
                        overflowY: 'hidden',
                    }}
                >
                    <animated.div style={{ overflow: 'visible', ...shifter, display: 'flex' }}>
                        <Butter
                            hasNoBids={noBids}
                            onClick={butcaller}
                            currIncrement={increments[0]}
                            increment={BigInt(5)}
                            toggled={
                                lastPressed === BigInt(5).toString() ||
                                (BigInt(5) === increments[0] && lastPressed === null)
                            }
                            endingEpoch={data.endingEpoch || 0}
                        />
                        <Butter
                            hasNoBids={noBids}
                            currIncrement={increments[0]}
                            onClick={butcaller}
                            increment={BigInt(10)}
                            toggled={
                                lastPressed === BigInt(10).toString() ||
                                (BigInt(10) === increments[0] && lastPressed === null)
                            }
                            endingEpoch={data.endingEpoch || 0}
                        />
                        <Butter
                            hasNoBids={noBids}
                            currIncrement={increments[0]}
                            onClick={butcaller}
                            increment={BigInt(15)}
                            toggled={
                                lastPressed === BigInt(15).toString() ||
                                (BigInt(15) === increments[0] && lastPressed === null)
                            }
                            endingEpoch={data.endingEpoch || 0}
                        />
                        <Butter
                            hasNoBids={noBids}
                            currIncrement={increments[0]}
                            onClick={butcaller}
                            increment={BigInt(20)}
                            toggled={
                                lastPressed === BigInt(20).toString() ||
                                (BigInt(20) === increments[0] && lastPressed === null)
                            }
                            endingEpoch={data.endingEpoch || 0}
                        />
                        <Butter
                            hasNoBids={noBids}
                            currIncrement={increments[0]}
                            onClick={butcaller}
                            increment={BigInt(25)}
                            toggled={
                                lastPressed === BigInt(25).toString() ||
                                (BigInt(25) === increments[0] && lastPressed === null)
                            }
                            endingEpoch={data.endingEpoch || 0}
                        />
                        <Butter
                            hasNoBids={noBids}
                            currIncrement={increments[0]}
                            onClick={butcaller}
                            increment={BigInt(30)}
                            toggled={
                                lastPressed === BigInt(30).toString() ||
                                (BigInt(30) === increments[0] && lastPressed === null)
                            }
                            endingEpoch={data.endingEpoch || 0}
                        />
                        <Butter
                            hasNoBids={noBids}
                            currIncrement={increments[0]}
                            onClick={butcaller}
                            increment={BigInt(35)}
                            toggled={
                                lastPressed === BigInt(35).toString() ||
                                (BigInt(35) === increments[0] && lastPressed === null)
                            }
                            endingEpoch={data.endingEpoch || 0}
                        />
                        <Butter
                            hasNoBids={noBids}
                            currIncrement={increments[0]}
                            onClick={butcaller}
                            increment={BigInt(40)}
                            toggled={
                                lastPressed === BigInt(40).toString() ||
                                (BigInt(40) === increments[0] && lastPressed === null)
                            }
                            endingEpoch={data.endingEpoch || 0}
                        />
                        <Butter
                            hasNoBids={noBids}
                            currIncrement={increments[0]}
                            onClick={butcaller}
                            increment={BigInt(45)}
                            toggled={
                                lastPressed === BigInt(45).toString() ||
                                (BigInt(45) === increments[0] && lastPressed === null)
                            }
                            endingEpoch={data.endingEpoch || 0}
                        />
                        <Butter
                            hasNoBids={noBids}
                            currIncrement={increments[0]}
                            onClick={butcaller}
                            increment={BigInt(50)}
                            toggled={
                                lastPressed === BigInt(50).toString() ||
                                (BigInt(50) === increments[0] && lastPressed === null)
                            }
                            endingEpoch={data.endingEpoch || 0}
                        />
                    </animated.div>
                </div>

                {check?.mustOfferOnSeller && (
                    <Text>
                        <CurrencyText
                            prefix="+"
                            unitOverride={localCurrencyPref}
                            forceEth
                            size="larger"
                            value={mspusd}
                            stopAnimation
                        />
                        {t`for bid on ${data.nuggToBuyFrom?.toPrettyId()}`}
                    </Text>
                )}

                <Button
                    className="mobile-pressable-div"
                    label={t`review`}
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
            butcaller,
            lastPressed,
            increments,
            currentPrice,
            estimator.error,
            data.endingEpoch,
            check?.mustOfferOnSeller,
            data.nuggToBuyFrom,
            leader?.incrementX64,
            minNextBidPair,
            shifter,
            noBids,
        ],
    );

    const Page1 = React.useMemo(
        () =>
            isOpen && peer ? (
                <>
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
                                {t`my current bid`}
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
                        {t`my desired bid`}
                    </Text>
                    <CurrencyText
                        unitOverride={localCurrencyPref}
                        forceEth
                        size="large"
                        stopAnimation
                        value={amountUsd}
                    />
                    {check?.mustOfferOnSeller && (
                        <>
                            <Text size="large" textStyle={{ marginTop: 10 }}>
                                {t`bid on ${data.nuggToBuyFrom?.toPrettyId()}`}
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
                        {t`payment`}
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
            check?.mustOfferOnSeller,
            localCurrencyPref,
        ],
    );

    const Page2 = React.useMemo(() => {
        return isOpen && chainId && address ? (
            <TransactionVisualConfirmation
                hash={hash}
                onDismiss={closeModal}
                tokenId={data.tokenId}
                error={error}
            />
        ) : null;
    }, [isOpen, closeModal, chainId, data.tokenId, hash, address, error]);

    return (
        <>
            {tabFadeTransition((sty, pager) => {
                return (
                    <animated.div
                        style={{
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
                            </>
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
                                        label={t`go back`}
                                        onClick={() => (pager === 0 ? closeModal() : setPage(0))}
                                    />
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
