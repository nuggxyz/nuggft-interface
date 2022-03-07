import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import { animated, config as springConfig, useSpring } from '@react-spring/web';
import { Web3Provider } from '@ethersproject/providers';

import Text from '@src/components/general/Texts/Text/Text';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import Button from '@src/components/general/Buttons/Button/Button';
import { fromEth } from '@src/lib/conversion';
import Colors from '@src/lib/colors';
import usePrevious from '@src/hooks/usePrevious';
import useSetState from '@src/hooks/useSetState';
import AppState from '@src/state/app';
import TransactionState from '@src/state/transaction';
import {
    isUndefinedOrNull,
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrBooleanFalse,
    isUndefinedOrNullOrNumberZero,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
    parseTokenIdSmart,
} from '@src/lib';
import web3 from '@src/web3';
import client from '@src/client';
import InteractiveText from '@src/components/general/Texts/InteractiveText/InteractiveText';
import { Chain } from '@src/web3/core/interfaces';
import { Route } from '@src/client/router';

import styles from './RingAbout.styles';

type Props = {};

const RingAbout: FunctionComponent<Props> = ({}) => {
    const screenType = AppState.select.screenType();
    const epoch = client.live.epoch();

    const address = web3.hook.usePriorityAccount();

    const lastSwap__tokenId = client.live.lastSwap__tokenId();
    const lastSwap__type = client.live.lastSwap__type();
    const lastSwap = client.live.lastSwap();
    console.log({ lastSwap, lastSwap__tokenId });

    const token = client.hook.useLiveToken(lastSwap__tokenId);

    const txnToggle = TransactionState.select.toggleCompletedTxn();
    const prevToggle = usePrevious(txnToggle);
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();

    const status = useSetState(() => {
        if (isUndefinedOrNull(token?.activeSwap?.endingEpoch) || isUndefinedOrNull(epoch))
            return 'waiting';

        return +token?.activeSwap?.epoch.endblock >= +epoch.endblock ? 'ongoing' : 'over';
    }, [epoch, token?.activeSwap?.endingEpoch]);

    const [open, setOpen] = useState(false);

    const { offers, leader } = client.hook.useSafeTokenOffers(lastSwap__tokenId);

    const leaderEns = web3.hook.usePriorityAnyENSName(provider, leader && leader.user);

    const hasBids = useMemo(
        () =>
            !isUndefinedOrNullOrObjectEmpty(leader) &&
            (status === 'over' || !isUndefinedOrNullOrNumberZero(+leader.eth)),
        [leader, status],
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
    }, [leader]);

    useEffect(() => {
        if (
            !isUndefinedOrNullOrArrayEmpty(offers) &&
            offers.length <= 1 &&
            !isUndefinedOrNullOrBooleanFalse(open)
        ) {
            setOpen(false);
        }
    }, [open, offers]);

    const springStyle = useSpring({
        ...styles.offersContainer,
        height: open ? '300px' : '0px',
        opacity: open ? 1 : 0,
        padding: open ? '0.75rem' : '0rem',
    });

    return (
        <>
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
                }}
            >
                <div style={styles.bodyContainer}>
                    <div
                        style={
                            styles[
                                screenType !== 'desktop'
                                    ? 'leaderContainerMobile'
                                    : 'leaderContainer'
                            ]
                        }
                    >
                        <Text
                            textStyle={{
                                ...styles.title,
                                ...(screenType === 'phone' && {
                                    color: Colors.nuggBlueText,
                                }),
                            }}
                        >
                            {(status === 'ongoing' && hasBids
                                ? 'Highest Offer'
                                : status === 'ongoing' && !hasBids
                                ? 'No offers yet...'
                                : status === 'waiting'
                                ? 'Place offer to begin auction'
                                : 'Winner ') + parseTokenIdSmart(lastSwap__tokenId)}
                        </Text>
                        {hasBids && status !== 'waiting' && (
                            <div
                                style={
                                    styles[
                                        screenType !== 'desktop'
                                            ? 'leadingOfferContainerMobile'
                                            : 'leadingOfferContainer'
                                    ]
                                }
                            >
                                <animated.div
                                    //@ts-ignore
                                    style={flashStyle}
                                >
                                    <CurrencyText
                                        image="eth"
                                        textStyle={styles.leadingOffer}
                                        value={+fromEth(leader.eth)}
                                    />
                                    <InteractiveText
                                        type="text"
                                        size="smaller"
                                        textStyle={{ color: Colors.textColor }}
                                        action={function (): void {
                                            web3.config.gotoEtherscan(chainId, 'tx', leader.txhash);
                                        }}
                                    >
                                        {leaderEns}
                                    </InteractiveText>
                                </animated.div>
                                {offers.length > 1 && (
                                    <Button
                                        rightIcon={
                                            !open ? (
                                                <ChevronUp color={Colors.nuggBlueText} size={14} />
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
                    <Text textStyle={{ marginBottom: '1rem' }}>Previous offers</Text>
                    {offers &&
                        offers.map(
                            (offer, index) =>
                                index !== 0 && (
                                    <OfferRenderItem
                                        {...{ provider, offer, index, chainId }}
                                        key={index}
                                    />
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
                                          name: 'OfferModal',
                                          modalData: {
                                              targetId: lastSwap__tokenId,
                                              type:
                                                  lastSwap__type === Route.SwapItem
                                                      ? 'OfferItem'
                                                      : 'OfferNugg',
                                            //   data: {
                                            //       tokenId: lastSwap__tokenId,
                                            //   },
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
        </>
    );
};

export default React.memo(RingAbout);

const OfferRenderItem = ({
    provider,
    chainId,
    offer,
    index,
}: {
    provider: Web3Provider;
    chainId: Chain;
    offer: NL.Redux.Swap.Offer & { txhash: string };
    index: number;
}) => {
    const leaderEns = web3.hook.usePriorityAnyENSName(provider, offer.user);
    return (
        <div style={styles.offerAmount}>
            <CurrencyText image="eth" value={+fromEth(offer.eth)} />
            <InteractiveText
                type="text"
                size="smaller"
                textStyle={{ color: Colors.textColor }}
                action={function (): void {
                    web3.config.gotoEtherscan(chainId, 'tx', offer.txhash);
                }}
            >
                {leaderEns}
            </InteractiveText>
        </div>
    );
};
