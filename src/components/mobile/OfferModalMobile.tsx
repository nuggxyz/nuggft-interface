import React, { startTransition, useState } from 'react';
import { BigNumber } from 'ethers';
import { animated, config, useSpring, useTransition } from '@react-spring/web';
import { IoChevronBackCircle } from 'react-icons/io5';

import useAsyncState from '@src/hooks/useAsyncState';
import lib, { shortenTxnHash } from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import Layout from '@src/lib/layout';
import web3 from '@src/web3';
import client from '@src/client';
import Colors from '@src/lib/colors';
import Label from '@src/components/general/Label/Label';
import { EthInt } from '@src/classes/Fraction';
import { OfferModalData } from '@src/interfaces/modals';
import {
    useNuggftV1,
    usePrioritySendTransaction,
    useTransactionManager2,
} from '@src/contracts/useContract';
import styles from '@src/components/modals/OfferModal/OfferModal.styles';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import Loader from '@src/components/general/Loader/Loader';
import useMountLogger from '@src/hooks/useMountLogger';
import NLStaticImage from '@src/components/general/NLStaticImage';
import { gotoEtherscan } from '@src/web3/config';
import OffersList from '@src/components/nugg/RingAbout/OffersList';
import { useUsdPair, useUsdPairWithCalculation } from '@src/client/usd';
import CurrencyToggler, {
    useCurrencyTogglerState,
} from '@src/components/general/Buttons/CurrencyToggler/CurrencyToggler';
import { DualCurrencyInputWithIcon } from '@src/components/general/TextInputs/CurrencyInput/CurrencyInput';

const OfferModal = ({ data }: { data: OfferModalData }) => {
    const isOpen = client.modal.useOpen();

    const address = web3.hook.usePriorityAccount();

    useMountLogger('OfferModal');
    const network = web3.hook.useNetworkProvider();
    const chainId = web3.hook.usePriorityChainId();
    const userBalance = web3.hook.usePriorityBalance(network);
    const peer = web3.hook.usePriorityPeer();
    const nuggft = useNuggftV1(network);
    const closeModal = client.modal.useCloseModal();
    const [page, setPage] = client.modal.usePhase();
    const { send, estimation: estimator, hash } = usePrioritySendTransaction();
    const transaction = useTransactionManager2(network, hash);
    const [amount, setAmount] = useState('0');
    const [lastPressed, setLastPressed] = React.useState('5');

    const check = useAsyncState<{
        canOffer: boolean | undefined;
        next: BigNumber | undefined;
        curr: BigNumber | undefined;
        eth: EthInt | undefined;
    }>(() => {
        if (data.tokenId && address && chainId && network) {
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
                    };
                }),

                nuggft.itemAgency(data.nuggToBuyFrom.toRawId(), data.tokenId.toRawId()),
            ]).then((_data) => {
                return { ..._data[0], ...lib.parse.agency(_data[1]) };
            });
        }
        return undefined;
    }, [address, chainId, network, data.nuggToBuyFor, data.nuggToBuyFrom]);

    React.useEffect(() => {
        if (check && check.eth && amount === '0') {
            setAmount(check.eth.copy().increase(BigInt(5)).number.toFixed(5));
        }
    }, [amount, check]);

    const amountUsd = useUsdPair(amount);
    const currentPrice = useUsdPair(check?.eth);
    const myBalance = useUsdPair(userBalance?.number);
    const currentBid = useUsdPair(check?.curr);
    const paymentUsd = useUsdPairWithCalculation(
        React.useMemo(() => [amount, check?.curr || 0], [amount, check]),
        React.useMemo(
            () =>
                ([_amount, _check]) => {
                    // was running into issue where "value" inside populatedTransaction was negative
                    const copy = _amount.copy();
                    if (copy.gt(0)) return copy.sub(_check);
                    return new EthInt(0);
                },
            [],
        ),
    );

    const populatedTransaction = React.useMemo(() => {
        const value = paymentUsd.eth.bignumber;
        if (!paymentUsd.eth.eq(0)) {
            if (data.isItem()) {
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
    }, [nuggft, paymentUsd, address, data]);

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

    const IncrementButton = React.memo(({ increment }: { increment: bigint }) => {
        return (
            <Button
                className="mobile-pressable-div"
                label={`+${increment.toString()}%`}
                onClick={() => {
                    setAmount(check?.eth?.copy().increase(increment).number.toFixed(5) || '0');
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

    const [localCurrencyPref, setLocalCurrencyPref] = useCurrencyTogglerState(globalCurrencyPref);

    const Page0 = React.useMemo(
        () => (
            <>
                <Text size="larger" textStyle={{ marginTop: 10 }}>
                    Current Price
                </Text>

                <CurrencyText
                    unitOverride={localCurrencyPref}
                    forceEth
                    stopAnimation
                    size="larger"
                    value={currentPrice}
                />

                <Text size="larger" textStyle={{ marginTop: 10 }}>
                    My Balance
                </Text>
                <CurrencyText
                    unitOverride={localCurrencyPref}
                    forceEth
                    size="larger"
                    value={myBalance}
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
                            background: Colors.transparentPrimaryColorSuper,
                            padding: '.3rem .6rem',
                            borderRadius: Layout.borderRadius.mediumish,
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
                    <IncrementButton increment={BigInt(5)} />
                    <IncrementButton increment={BigInt(10)} />
                    <IncrementButton increment={BigInt(15)} />
                    <IncrementButton increment={BigInt(20)} />
                    <IncrementButton increment={BigInt(25)} />
                    <IncrementButton increment={BigInt(30)} />
                </div>

                <Button
                    className="mobile-pressable-div"
                    label="Review"
                    // leftIcon={calculating ? <Loader /> : undefined}
                    onClick={() => setPage(1)}
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

                {/* <Button
                    className="mobile-pressable-div"
                    size="small"
                    buttonStyle={{ background: 'transparent', marginTop: 10, marginBottom: -10 }}
                    label="cancel"
                    onClick={closeModal}
                /> */}
            </>
        ),
        [
            amount,
            setPage,
            calculating,
            localCurrencyPref,
            IncrementButton,
            currentPrice,
            estimator.error,
            myBalance,
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
                    {/* <Text size="large" textStyle={{ marginTop: 10 }}>
                        Estimated Gas Fee
                    </Text>
                    <CurrencyText
                        size="large"
                        stopAnimation
                        value={estimation?.mul.number || 0}
                        forceEth
                    />{' '} */}
                    <Text size="large" textStyle={{ marginTop: 10 }}>
                        Payment
                    </Text>
                    <CurrencyText
                        unitOverride={localCurrencyPref}
                        forceEth
                        size="largerish"
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

                    {/* <Button
                        className="mobile-pressable-div"
                        size="small"
                        buttonStyle={{
                            background: 'transparent',
                            marginTop: 10,
                            marginBottom: -10,
                        }}
                        label="go back"
                        onClick={() => setPage(0)}
                    /> */}
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
            localCurrencyPref,
        ],
    );

    const Page2 = React.useMemo(() => {
        return isOpen && chainId ? (
            <>
                <div
                    style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <AnimatedConfirmation confirmed={!!transaction?.receipt} />

                    {!transaction?.response && (
                        <div
                            style={{
                                display: 'flex',
                                width: '100%',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: 20,
                                marginTop: 20,
                            }}
                        >
                            <Label
                                text="looking for your transaction..."
                                textStyle={{ color: 'white' }}
                                containerStyles={{ background: lib.colors.nuggGold }}
                            />
                        </div>
                    )}

                    {transaction?.response && !transaction?.receipt && hash && (
                        <div
                            style={{
                                display: 'flex',
                                width: '100%',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: 20,
                                marginTop: 20,
                                marginBottom: 20,
                            }}
                        >
                            <Label
                                text={shortenTxnHash(hash)}
                                textStyle={{ color: 'white' }}
                                containerStyles={{
                                    background: lib.colors.etherscanBlue,
                                    marginBottom: 20,
                                }}
                            />
                            <Text textStyle={{ marginBottom: 20 }}>it should be included soon</Text>
                            <Button
                                onClick={() => gotoEtherscan(chainId, 'tx', hash)}
                                label="view on etherscan"
                                textStyle={{ color: lib.colors.etherscanBlue }}
                                buttonStyle={{ borderRadius: lib.layout.borderRadius.large }}
                            />
                        </div>
                    )}

                    {transaction?.response && transaction?.receipt && (
                        <div
                            style={{
                                display: 'flex',
                                width: '100%',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: 20,
                                marginTop: 20,
                                marginBottom: 20,
                            }}
                        >
                            <Label
                                text="boom, you're in the lead"
                                textStyle={{ color: 'white' }}
                                containerStyles={{ background: lib.colors.green, marginBottom: 20 }}
                            />
                            <OffersList tokenId={data.tokenId} onlyLeader />
                        </div>
                    )}

                    <Button
                        label="dismiss"
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
            </>
        ) : null;
    }, [transaction, isOpen, closeModal, setPage, chainId, data.tokenId, hash]);

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
                            }}
                        >
                            <>{pager === 0 ? Page0 : pager === 1 ? Page1 : Page2}</>{' '}
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
