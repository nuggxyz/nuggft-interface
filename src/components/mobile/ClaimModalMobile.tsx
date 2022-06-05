/* eslint-disable react/jsx-props-no-spreading */
import React, { startTransition } from 'react';
import { animated, config, useSpring, useTransition } from '@react-spring/web';
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';
import { IoChevronBackCircle } from 'react-icons/io5';
import { t } from '@lingui/macro';

import lib from '@src/lib';
import Text from '@src/components/general/Texts/Text/Text';
import web3 from '@src/web3';
import Button from '@src/components/general/Buttons/Button/Button';
import client from '@src/client';
import { ClaimModalData } from '@src/interfaces/modals';
import { useNuggftV1, usePrioritySendTransaction } from '@src/contracts/useContract';
import { EthInt } from '@src/classes/Fraction';
import { useUsdPair } from '@src/client/usd';
import useAsyncState from '@src/hooks/useAsyncState';
import CurrencyToggler, {
    useCurrencyTogglerState,
} from '@src/components/general/Buttons/CurrencyToggler/CurrencyToggler';
import Label from '@src/components/general/Label/Label';
import NLStaticImage from '@src/components/general/NLStaticImage';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import Loader from '@src/components/general/Loader/Loader';
import { useMultiClaimArgs } from '@src/components/nugg/Wallet/tabs/ClaimTab/MultiClaimButton';
import TransactionVisualConfirmation from '@src/components/nugg/TransactionVisualConfirmation';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ClaimModalMobile = ({ data }: { data: ClaimModalData }) => {
    const isOpen = client.modal.useOpen();
    const unclaimedOffers = client.live.myUnclaimedOffers();

    const network = web3.hook.useNetworkProvider();
    const peer = web3.hook.usePriorityPeer();
    const nuggft = useNuggftV1(network);
    const closeModal = client.modal.useCloseModal();
    const [page, setPage] = client.modal.usePhase();
    const { send, estimation: estimator, hash } = usePrioritySendTransaction();

    const args = useMultiClaimArgs();

    const populatedTransaction = React.useMemo(() => {
        return { amount: args[0].length, tx: nuggft.populateTransaction.claim(...args) };
    }, [nuggft, args]);

    const estimation = useAsyncState(() => {
        if (network) {
            return Promise.all([
                estimator.estimate(populatedTransaction.tx),
                network?.getGasPrice(),
            ]).then((_data) => ({
                gasLimit: _data[0] || BigNumber.from(0),
                gasPrice: new EthInt(_data[1] || 0),
                mul: new EthInt((_data[0] || BigNumber.from(0)).mul(_data[1] || 0)),
                amount: args[0].length,
            }));
        }

        return undefined;
    }, [populatedTransaction, network]);

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
        if (estimation) {
            if (populatedTransaction.amount === estimation.amount) return false;
        }
        return true;
    }, [populatedTransaction, estimation, estimator.error]);

    const globalCurrencyPref = client.usd.useCurrencyPreferrence();

    const [localCurrencyPref, setLocalCurrencyPref] = useCurrencyTogglerState(globalCurrencyPref);

    const ethclaims = React.useMemo(() => {
        return unclaimedOffers.reduce((prev, curr) => {
            return prev.add(curr.leader ? 0 : curr.eth);
        }, new EthInt(0));
    }, [unclaimedOffers]);

    const ethclaimsUsd = useUsdPair(ethclaims);
    const estimatedGasUsd = useUsdPair(estimation?.mul);

    const Page0 = React.useMemo(
        () => (
            <>
                <Text size="larger" textStyle={{ marginTop: 10 }}>
                    Claim
                </Text>

                <div
                    style={{
                        display: 'flex',
                        width: '100%',
                        justifyContent: 'space-between',
                        marginTop: 10,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%',
                        }}
                    >
                        {calculating ? (
                            <Loader style={{ color: lib.colors.primaryColor }} />
                        ) : estimator.error ? (
                            <Label
                                size="large"
                                containerStyles={{ background: lib.colors.red }}
                                textStyle={{ color: 'white' }}
                                text={lib.errors.prettify('claim-modal', estimator.error)}
                            />
                        ) : (
                            <Label
                                size="large"
                                containerStyles={{ background: lib.colors.green }}
                                textStyle={{ color: 'white' }}
                                text="transaction should succeed"
                            />
                        )}
                    </div>
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
            </>
        ),
        [setPage, calculating, estimator.error],
    );

    const Page1 = React.useMemo(
        () =>
            isOpen && peer ? (
                <>
                    {/* <StupidMfingHack /> */}

                    <Text size="large" textStyle={{ marginTop: 10 }}>
                        {t`new nugg claims`}
                    </Text>
                    <CurrencyText
                        size="large"
                        stopAnimation
                        showUnit={false}
                        value={0}
                        str={`${unclaimedOffers.filter((x) => x.isNugg() && x.leader).length}`}
                    />

                    <Text size="large" textStyle={{ marginTop: 10 }}>
                        {t`new item claims`}
                    </Text>
                    <CurrencyText
                        size="large"
                        stopAnimation
                        showUnit={false}
                        value={0}
                        str={`${unclaimedOffers.filter((x) => x.isItem() && x.leader).length}`}
                    />

                    <Text size="large" textStyle={{ marginTop: 10 }}>
                        {t`eth claims`}
                    </Text>
                    <CurrencyText
                        unitOverride={localCurrencyPref}
                        forceEth
                        size="large"
                        stopAnimation
                        value={ethclaimsUsd}
                    />

                    <Text size="large" textStyle={{ marginTop: 10 }}>
                        {t`estimated gas price`}
                    </Text>
                    <CurrencyText
                        unitOverride={localCurrencyPref}
                        forceEth
                        size="large"
                        stopAnimation
                        value={estimatedGasUsd}
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
                                        {t`tap to finalize on`}
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
            setPage,
            isOpen,
            send,
            populatedTransaction,
            peer,
            estimatedGasUsd,
            ethclaimsUsd,
            unclaimedOffers,
            localCurrencyPref,
        ],
    );

    const Page2 = React.useMemo(() => {
        return isOpen ? (
            <TransactionVisualConfirmation
                hash={hash}
                onDismiss={() => {
                    closeModal();
                    startTransition(() => {
                        setTimeout(() => {
                            setPage(0);
                        }, 2000);
                    });
                }}
            />
        ) : null;
    }, [isOpen, closeModal, setPage, hash]);

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

export default ClaimModalMobile;
