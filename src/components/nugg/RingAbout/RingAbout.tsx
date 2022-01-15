import { title } from 'process';

import React, {
    FunctionComponent,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import { animated, config, useSpring, useTransition } from 'react-spring';
import { BigNumber } from 'ethers';

import Text from '../../general/Texts/Text/Text';
import CurrencyText from '../../general/Texts/CurrencyText/CurrencyText';
import SwapState from '../../../state/swap';
import Button from '../../general/Buttons/Button/Button';
import AppState from '../../../state/app';
import Web3State from '../../../state/web3';
import {
    isUndefinedOrNull,
    isUndefinedOrNullOrNumberZero,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../../lib';
import { fromEth } from '../../../lib/conversion';
import Colors from '../../../lib/colors';
import TransactionState from '../../../state/transaction';
import usePrevious from '../../../hooks/usePrevious';
import NuggftV1Helper from '../../../contracts/NuggftV1Helper';
import useSetState from '../../../hooks/useSetState';
import ProtocolState from '../../../state/protocol';

import styles from './RingAbout.styles';

type Props = {};

const RingAbout: FunctionComponent<Props> = ({}) => {
    const screenType = AppState.select.screenType();
    const eth = SwapState.select.eth();
    const epoch = ProtocolState.select.epoch();
    const endingSwapEpoch = SwapState.select.epoch();
    const address = Web3State.select.web3address();
    const ethUsd = SwapState.select.ethUsd();
    const leader = SwapState.select.leader();
    const offers = SwapState.select.offers();
    const swapId = SwapState.select.id();
    const txnToggle = TransactionState.select.toggleCompletedTxn();
    const prevToggle = usePrevious(txnToggle);

    // const status = SwapState.select.status();

    const status = useSetState(() => {
        return isUndefinedOrNull(endingSwapEpoch) || isUndefinedOrNull(epoch)
            ? 'waiting'
            : +endingSwapEpoch.endblock >= +epoch.endblock
            ? 'ongoing'
            : 'over';
    }, [epoch, endingSwapEpoch]);

    useEffect(() => {
        if (
            status === 'waiting' &&
            prevToggle !== undefined &&
            prevToggle !== txnToggle
        ) {
            SwapState.dispatch.initSwap({ swapId });
        }
    }, [status, txnToggle, swapId, prevToggle]);

    const [open, setOpen] = useState(false);

    const leaderEns = Web3State.hook.useEns(leader);

    const hasBids = useMemo(
        () =>
            !isUndefinedOrNullOrStringEmpty(leader) &&
            !isUndefinedOrNullOrStringEmpty(eth) &&
            !isUndefinedOrNullOrNumberZero(+eth),
        [eth, leader],
    );

    useEffect(() => {
        api.start({
            to: [
                {
                    ...styles.leadingOfferAmount,
                    background: 'white',
                },
                {
                    ...styles.leadingOfferAmount,
                    background: Colors.transparentWhite,
                },
            ],
        });
    }, [eth]);

    const [flashStyle, api] = useSpring(() => {
        return {
            to: [
                {
                    ...styles.leadingOfferAmount,
                    background: 'white',
                },
                {
                    ...styles.leadingOfferAmount,
                    background: Colors.transparentWhite,
                },
            ],
            from: {
                ...styles.leadingOfferAmount,
                background: Colors.transparentWhite,
            },
            config: config.molasses,
        };
    });

    const springStyle = useSpring({
        ...styles.offersContainer,
        height: open ? '300px' : '0px',
        opacity: open ? 1 : 0,
        padding: open ? '0.75rem' : '0rem',
    });

    return (
        <animated.div
            style={{
                ...styles.container,
                ...(screenType === 'phone' && {
                    ...styles.mobile,
                    background: springStyle.opacity.to(
                        [0, 1],
                        ['#FFFFFF00', Colors.transparentWhite],
                    ),
                }),
            }}>
            <div style={styles.bodyContainer}>
                <div
                    style={
                        styles[
                            screenType !== 'desktop'
                                ? 'leaderContainerMobile'
                                : 'leaderContainer'
                        ]
                    }>
                    <Text
                        textStyle={{
                            ...styles.title,
                            ...(screenType === 'phone' && {
                                color: Colors.nuggBlueText,
                            }),
                        }}>
                        {status === 'ongoing' && hasBids
                            ? 'Highest Offer'
                            : status === 'ongoing' && !hasBids
                            ? 'No offers yet...'
                            : status === 'waiting'
                            ? 'Place offer to begin auction'
                            : 'Winner'}
                    </Text>
                    {hasBids && status !== 'waiting' && (
                        <div
                            style={
                                styles[
                                    screenType !== 'desktop'
                                        ? 'leadingOfferContainerMobile'
                                        : 'leadingOfferContainer'
                                ]
                            }>
                            <animated.div
                                //@ts-ignore
                                style={flashStyle}>
                                <CurrencyText
                                    image="eth"
                                    textStyle={styles.leadingOffer}
                                    value={+fromEth(eth)}
                                />
                                <Text textStyle={styles.code}>{leaderEns}</Text>
                            </animated.div>
                            {offers.length > 1 && (
                                <Button
                                    rightIcon={
                                        !open ? (
                                            <ChevronUp
                                                color={Colors.nuggBlueText}
                                                size={14}
                                            />
                                        ) : (
                                            <ChevronDown
                                                color={Colors.nuggBlueText}
                                                size={14}
                                            />
                                        )
                                    }
                                    onClick={() => setOpen(!open)}
                                    buttonStyle={styles.allOffersButton}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
            {/*//@ts-ignore*/}
            <animated.div style={springStyle}>
                <Text textStyle={{ marginBottom: '1rem' }}>
                    Previous offers
                </Text>
                {offers.map(
                    (offer, index) =>
                        index !== 0 && (
                            <OfferRenderItem
                                {...{ offer, index }}
                                key={index}
                            />
                        ),
                )}
            </animated.div>

            {status !== 'over' &&
                (screenType === 'phone' ||
                    !isUndefinedOrNullOrStringEmpty(address)) && (
                    <Button
                        buttonStyle={{
                            ...styles.button,
                            ...(screenType === 'phone' && {
                                background: Colors.nuggBlueText,
                            }),
                        }}
                        textStyle={{
                            ...styles.buttonText,
                            ...(screenType === 'phone' && {
                                color: 'white',
                            }),
                        }}
                        onClick={() =>
                            screenType === 'phone' &&
                            isUndefinedOrNullOrStringEmpty(address)
                                ? AppState.dispatch.changeMobileView('Wallet')
                                : AppState.dispatch.setModalOpen({
                                      name: 'OfferOrSell',
                                      modalData: {
                                          type: 'Offer',
                                      },
                                  })
                        }
                        label={
                            screenType === 'phone' &&
                            isUndefinedOrNullOrStringEmpty(address)
                                ? 'Connect wallet'
                                : 'Place offer'
                        }
                    />
                )}
        </animated.div>
    );
};

export default React.memo(RingAbout);

const OfferRenderItem = ({
    offer,
    index,
}: {
    offer: NL.GraphQL.Fragments.Offer.Bare;
    index: number;
}) => {
    const ens = Web3State.hook.useEns(offer.user.id);
    return (
        <div style={styles.offerAmount}>
            <CurrencyText image="eth" value={+fromEth(offer.eth)} />
            <Text textStyle={styles.code}>{ens}</Text>
        </div>
    );
};
