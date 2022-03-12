import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import { animated, config as springConfig, useSpring } from '@react-spring/web';
import { Web3Provider } from '@ethersproject/providers';

import Text from '@src/components/general/Texts/Text/Text';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import Button from '@src/components/general/Buttons/Button/Button';
import Colors from '@src/lib/colors';
import AppState from '@src/state/app';
import TransactionState from '@src/state/transaction';
import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrBooleanFalse,
    isUndefinedOrNullOrStringEmpty,
    parseTokenId,
    parseTokenIdSmart,
} from '@src/lib';
import web3 from '@src/web3';
import client from '@src/client';
import { Route } from '@src/client/router';
import constants from '@src/lib/constants';
import TxViewer from '@src/components/general/Texts/TxViewer/TxViewer';
import { OfferData } from '@src/client/core';
import InteractiveText from '@src/components/general/Texts/InteractiveText/InteractiveText';
import { Chain } from '@src/web3/core/interfaces';

import styles from './RingAbout.styles';

type Props = {};

const RingAbout: FunctionComponent<Props> = ({}) => {
    const screenType = AppState.select.screenType();

    const address = web3.hook.usePriorityAccount();

    const lastSwap__tokenId = client.live.lastSwap__tokenId();
    const lastSwap__type = client.live.lastSwap__type();
    const { token, epoch, lifecycle } = client.hook.useLiveToken(lastSwap__tokenId);

    const isItemSwap = useMemo(
        () => lastSwap__tokenId?.includes(constants.ID_PREFIX_ITEM),
        [lastSwap__tokenId],
    );

    const txnToggle = TransactionState.select.toggleCompletedTxn();
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();

    const [open, setOpen] = useState(false);

    const offers = client.live.offers(lastSwap__tokenId);

    const leader = useMemo(() => {
        console.log({ offers });
        if (offers?.length > 0) return offers[0];
        else return undefined;
    }, [offers]);

    const hasBids = useMemo(() => !!leader, [leader]);

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
    console.log({ lifecycle });
    return lifecycle !== 'stands' ? (
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
                            {(lifecycle === 'deck' || lifecycle === 'bat') && hasBids
                                ? 'Highest Offer'
                                : (lifecycle === 'deck' || lifecycle === 'bat') && !hasBids
                                ? 'No offers yet...'
                                : lifecycle === 'bench'
                                ? 'Place offer to begin auction'
                                : lifecycle === 'shower'
                                ? 'Winner ' + parseTokenIdSmart(lastSwap__tokenId)
                                : 'oops shouldnt be here'}
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
                                        value={leader.eth.decimal.toNumber()}
                                    />
                                    <TxViewer
                                        size="smaller"
                                        textStyle={{ color: Colors.textColor }}
                                        address={leader && leader.user}
                                        // route={'tx'}
                                        hash={leader && leader.txhash}
                                    />
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
                                        {...{ provider, offer, index, chainId, isItemSwap }}
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
    ) : (
        <></>
    );
};

export default React.memo(RingAbout);
const OfferRenderItem = ({
    provider,
    chainId,
    offer,
    index,
    isItemSwap,
}: {
    provider: Web3Provider;
    chainId: Chain;
    offer: OfferData;
    index: number;
    isItemSwap: boolean;
}) => {
    const leader = isItemSwap
        ? parseTokenId(offer.user)
        : web3.hook.usePriorityAnyENSName(provider, offer.user);
    return (
        <div style={styles.offerAmount}>
            <CurrencyText image="eth" value={offer.eth.decimal.toNumber()} />
            <InteractiveText
                type="text"
                size="smaller"
                textStyle={{ color: Colors.textColor }}
                action={function (): void {
                    web3.config.gotoEtherscan(chainId, 'tx', offer.txhash);
                }}
            >
                {leader}
            </InteractiveText>
        </div>
    );
};
