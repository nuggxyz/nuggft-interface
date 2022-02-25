import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import { animated, config as springConfig, useSpring } from 'react-spring';
import { Web3Provider } from '@ethersproject/providers';

import Text from '@src/components/general/Texts/Text/Text';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import Button from '@src/components/general/Buttons/Button/Button';
import { fromEth } from '@src/lib/conversion';
import Colors from '@src/lib/colors';
import usePrevious from '@src/hooks/usePrevious';
import useSetState from '@src/hooks/useSetState';
import ProtocolState from '@src/state/protocol';
import AppState from '@src/state/app';
import SwapState from '@src/state/swap';
import TransactionState from '@src/state/transaction';
import {
    isUndefinedOrNull,
    isUndefinedOrNullOrNumberZero,
    isUndefinedOrNullOrStringEmpty,
} from '@src/lib';
import web3 from '@src/web3';

import styles from './RingAbout.styles';

type Props = {};

const RingAbout: FunctionComponent<Props> = ({}) => {
    const screenType = AppState.select.screenType();
    const eth = SwapState.select.eth();
    const epoch = ProtocolState.select.epoch();
    const endingSwapEpoch = SwapState.select.epoch();
    const address = web3.hook.usePriorityAccount();
    const ethUsd = SwapState.select.ethUsd();
    const leader = SwapState.select.leader();
    const offers = SwapState.select.offers();
    const swapId = SwapState.select.id();
    const txnToggle = TransactionState.select.toggleCompletedTxn();
    const prevToggle = usePrevious(txnToggle);
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();

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
            prevToggle !== txnToggle &&
            !isUndefinedOrNullOrStringEmpty(swapId) &&
            !swapId.includes('undefined')
        ) {
            SwapState.dispatch.initSwap({ swapId, chainId });
        }
    }, [status, txnToggle, swapId, prevToggle, chainId]);

    const [open, setOpen] = useState(false);

    //TODO figure this out
    // const leaderEns = useENS(provider, [leader]);

    const hasBids = useMemo(
        () =>
            !isUndefinedOrNullOrStringEmpty(leader) &&
            !isUndefinedOrNullOrStringEmpty(eth) &&
            (status === 'over' || !isUndefinedOrNullOrNumberZero(+eth)),
        [eth, leader, status],
    );

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
            config: springConfig.molasses,
        };
    });

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
                            screenType !== 'desktop' ? 'leaderContainerMobile' : 'leaderContainer'
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
                                <Text
                                    type="text"
                                    size="smaller"
                                    textStyle={{ color: Colors.textColor }}>
                                    {leader}
                                </Text>
                            </animated.div>
                            {offers.length > 1 && (
                                <Button
                                    rightIcon={
                                        !open ? (
                                            <ChevronUp color={Colors.nuggBlueText} size={14} />
                                        ) : (
                                            <ChevronDown color={Colors.nuggBlueText} size={14} />
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
                <Text textStyle={{ marginBottom: '1rem' }}>Previous offers</Text>
                {offers.map(
                    (offer, index) =>
                        index !== 0 && (
                            <OfferRenderItem {...{ provider, offer, index }} key={index} />
                        ),
                )}
            </animated.div>

            {status !== 'over' &&
                (screenType === 'phone' || !isUndefinedOrNullOrStringEmpty(address)) && (
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
                            screenType === 'phone' && isUndefinedOrNullOrStringEmpty(address)
                                ? AppState.dispatch.changeMobileView('Wallet')
                                : AppState.dispatch.setModalOpen({
                                      name: 'OfferOrSell',
                                      modalData: {
                                          type: 'Offer',
                                      },
                                  })
                        }
                        label={
                            screenType === 'phone' && isUndefinedOrNullOrStringEmpty(address)
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
    provider,
    offer,
    index,
}: {
    provider: Web3Provider;
    offer: NL.GraphQL.Fragments.Offer.Bare;
    index: number;
}) => {
    // TODO - fix ens
    const leaderEns = web3.hook.usePriorityAnyENSName(provider, offer.user.id);
    return (
        <div style={styles.offerAmount}>
            <CurrencyText image="eth" value={+fromEth(offer.eth)} />
            <Text type="text" size="smaller" textStyle={{ color: Colors.textColor }}>
                {leaderEns && leaderEns[0]}
            </Text>
        </div>
    );
};
