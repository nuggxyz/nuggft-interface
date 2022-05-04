import React, { startTransition, useState } from 'react';
import { animated, config, useSpring, useTransition } from '@react-spring/web';
import { BigNumber } from 'ethers';
import { IoChevronBackCircle, IoLogoUsd } from 'react-icons/io5';
import { SiEthereum } from 'react-icons/si';

import lib, { shortenTxnHash } from '@src/lib';
import { DualCurrencyInput } from '@src/components/general/TextInputs/CurrencyInput/CurrencyInput';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import web3 from '@src/web3';
import Button from '@src/components/general/Buttons/Button/Button';
import client from '@src/client';
import { SellModalData } from '@src/interfaces/modals';
import {
    useNuggftV1,
    usePrioritySendTransaction,
    useTransactionManager2,
} from '@src/contracts/useContract';
import { EthInt } from '@src/classes/Fraction';
import { useUsdPair } from '@src/client/usd';
import useAsyncState from '@src/hooks/useAsyncState';
import Colors from '@src/lib/colors';
import { gotoEtherscan } from '@src/web3/config';
import CurrencyToggler, {
    useCurrencyTogglerState,
} from '@src/components/general/Buttons/CurrencyToggler/CurrencyToggler';
import Label from '@src/components/general/Label/Label';
import NLStaticImage from '@src/components/general/NLStaticImage';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import OffersList from '@src/components/nugg/RingAbout/OffersList';
import Loader from '@src/components/general/Loader/Loader';

import { AnimatedConfirmation } from './OfferModalMobile';

const SellNuggOrItemModalMobile = ({ data }: { data: SellModalData }) => {
    const isOpen = client.modal.useOpen();

    const address = web3.hook.usePriorityAccount();
    const stake = client.static.stake();

    const provider = web3.hook.usePriorityProvider();

    const network = web3.hook.useNetworkProvider();
    const chainId = web3.hook.usePriorityChainId();
    const peer = web3.hook.usePriorityPeer();
    const nuggft = useNuggftV1(network);
    const closeModal = client.modal.useCloseModal();
    const [page, setPage] = client.modal.usePhase();
    const { send, estimation: estimator, hash } = usePrioritySendTransaction();
    const transaction = useTransactionManager2(network, hash);
    const [amount, setAmount] = useState('0');
    const [lastPressed, setLastPressed] = React.useState<string | undefined>('5');

    useTransactionManager2(provider, hash, closeModal);

    const amountUsd = useUsdPair(amount);

    const populatedTransaction = React.useMemo(() => {
        const value = amountUsd.eth.bignumber;
        if (!value.isZero()) {
            if (data.isItem()) {
                return {
                    tx: nuggft.populateTransaction['sell(uint24,uint16,uint96)'](
                        data.sellingNuggId.toRawId(),
                        data.tokenId.toRawId(),
                        value,
                    ),

                    amount: value,
                };
            }
            return {
                tx: nuggft.populateTransaction['sell(uint24,uint96)'](
                    data.tokenId.toRawId(),
                    value,
                ),
                amount: value,
            };
        }

        return undefined;
    }, [nuggft, amountUsd, address, data]);

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

    const eps = useAsyncState(() => {
        return nuggft.eps();
    }, [nuggft, stake]);

    const epsUsd = useUsdPair(eps);

    const [valueIsSet, setValue] = React.useReducer(() => true, false);

    const wrappedSetAmount = React.useCallback(
        (amt: string) => {
            setAmount(amt);
            setLastPressed(undefined);
        },
        [setAmount, setLastPressed],
    );

    React.useEffect(() => {
        if (eps && epsUsd && epsUsd.eth && !valueIsSet) {
            wrappedSetAmount(epsUsd.eth.copy().increase(BigInt(5)).number.toFixed(5));
            setValue();
        }
    }, [amount, eps, epsUsd, epsUsd.eth, valueIsSet, setValue, wrappedSetAmount]);

    const IncrementButton = React.memo(({ increment }: { increment: bigint }) => {
        return (
            <Button
                className="mobile-pressable-div"
                label={`+${increment.toString()}%`}
                onClick={() => {
                    wrappedSetAmount(
                        epsUsd.eth.copy().increase(increment).number.toFixed(5) || '0',
                    );
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
                    Minimum
                </Text>

                <CurrencyText
                    unitOverride={localCurrencyPref}
                    forceEth
                    stopAnimation
                    size="larger"
                    value={epsUsd}
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

                <div
                    style={{
                        display: 'flex',
                        width: '100%',
                        alignItems: 'flex-end',
                        padding: '.5rem',
                    }}
                >
                    <DualCurrencyInput
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            color: lib.colors.primaryColor,
                            position: 'relative',
                        }}
                        leftToggles={[
                            localCurrencyPref === 'ETH' ? (
                                <SiEthereum
                                    color={lib.colors.primaryColor}
                                    size={32}
                                    style={{ left: 10, position: 'absolute', height: '100%' }}
                                />
                            ) : (
                                <IoLogoUsd
                                    color={lib.colors.primaryColor}
                                    size={32}
                                    style={{ left: 10, position: 'absolute', height: '100%' }}
                                />
                            ),
                        ]}
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
                            borderRadius: lib.layout.borderRadius.mediumish,
                        }}
                        currencyPref={localCurrencyPref}
                        // label={t`Enter amount`}
                        setValue={wrappedSetAmount}
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
        [amount, setPage, calculating, localCurrencyPref, IncrementButton, estimator.error, epsUsd],
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
                        Minimum
                    </Text>
                    <CurrencyText
                        unitOverride={localCurrencyPref}
                        forceEth
                        size="large"
                        stopAnimation
                        value={epsUsd}
                    />
                    <Text size="large" textStyle={{ marginTop: 10 }}>
                        My Asking Price
                    </Text>
                    <CurrencyText
                        unitOverride={localCurrencyPref}
                        forceEth
                        size="large"
                        stopAnimation
                        value={amountUsd}
                    />

                    <Text size="large" textStyle={{ marginTop: 10 }}>
                        Payment
                    </Text>
                    <CurrencyText
                        unitOverride={localCurrencyPref}
                        forceEth
                        size="largerish"
                        stopAnimation
                        value={amountUsd}
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
            setPage,
            isOpen,
            send,
            populatedTransaction,
            peer,
            epsUsd,
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

export default SellNuggOrItemModalMobile;
