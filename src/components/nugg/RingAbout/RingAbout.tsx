/* eslint-disable no-nested-ternary */
// @ts-strict

import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import { animated, config as springConfig, useSpring } from '@react-spring/web';
import { Web3Provider } from '@ethersproject/providers';

import Text from '@src/components/general/Texts/Text/Text';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import Button from '@src/components/general/Buttons/Button/Button';
import Colors from '@src/lib/colors';
import AppState from '@src/state/app';
import lib, { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import web3 from '@src/web3';
import client from '@src/client';
import { Route } from '@src/client/router';
import TxViewer from '@src/components/general/Texts/TxViewer/TxViewer';
import { OfferData } from '@src/client/interfaces';
import InteractiveText from '@src/components/general/Texts/InteractiveText/InteractiveText';
import { Chain } from '@src/web3/core/interfaces';
import { LiveItem } from '@src/client/hooks/useLiveItem';
import { LiveNugg } from '@src/client/hooks/useLiveNugg';
import { Lifecycle } from '@src/client/hooks/useLiveToken';

import styles from './RingAbout.styles';

type Props = Record<string, never>;

const RingAbout: FunctionComponent<Props> = () => {
    const screenType = AppState.select.screenType();

    const address = web3.hook.usePriorityAccount();

    const tokenId = client.live.lastSwap.tokenId();
    const type = client.live.lastSwap.type();

    const { token, lifecycle } = client.hook.useLiveToken(tokenId);

    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();

    const [open, setOpen] = useState(false);

    const offers = client.live.offers(tokenId);

    const leader = useMemo(() => {
        if (offers.length > 0) return offers[0];
        return undefined;
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
        if (offers && offers.length <= 1 && open) {
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

    return type !== undefined && tokenId && lifecycle !== 'stands' ? (
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
                            screenType !== 'desktop' ? 'leaderContainerMobile' : 'leaderContainer'
                        ]
                    }
                >
                    {lifecycle === Lifecycle.Tryout &&
                    token?.type === 'item' &&
                    token.tryout.min &&
                    token.tryout.max ? (
                        <div
                            onClick={() => client.actions.routeTo(tokenId, false)}
                            aria-hidden="true"
                            role="button"
                            style={{
                                padding: '.25rem 1rem',
                            }}
                        >
                            <div
                                style={{
                                    background: lib.colors.gradient2Transparent,
                                    padding: '.5rem 1rem',
                                    borderRadius: lib.layout.borderRadius.mediumish,
                                    // postion: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    justifyContent: 'stretch',
                                    width: '100%',
                                    // background: lib.colors.gradient2,
                                }}
                            >
                                <div
                                    style={{
                                        width: '100%',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        display: 'flex',
                                    }}
                                >
                                    <Text textStyle={{ color: lib.colors.primaryColor }}>
                                        {/* eslint-disable-next-line no-nested-ternary */}
                                        {`On sale by ${token.tryout.count} Nugg${
                                            token.tryout.count > 1 ? 's' : ''
                                        }`}
                                    </Text>
                                    {token.tryout.min.eth.eq(token.tryout.max.eth) ? (
                                        <div>
                                            <div style={{ display: 'flex' }}>
                                                <CurrencyText
                                                    image="eth"
                                                    value={token.tryout.min.eth.decimal.toNumber()}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div style={{ display: 'flex' }}>
                                                <CurrencyText
                                                    image="eth"
                                                    value={token.tryout.min.eth.decimal.toNumber()}
                                                />
                                                <Text textStyle={{ marginLeft: '5px' }}>Min</Text>
                                            </div>
                                            <div style={{ display: 'flex' }}>
                                                <CurrencyText
                                                    image="eth"
                                                    value={token.tryout.max.eth.decimal.toNumber()}
                                                />
                                                <Text textStyle={{ marginLeft: '5px' }}>Max</Text>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <Text
                                textStyle={{
                                    ...styles.title,
                                    ...(screenType === 'phone' && {
                                        color: Colors.nuggBlueText,
                                    }),
                                }}
                            >
                                {(lifecycle === Lifecycle.Deck || lifecycle === Lifecycle.Bat) &&
                                hasBids
                                    ? 'Highest Offer'
                                    : (lifecycle === Lifecycle.Deck ||
                                          lifecycle === Lifecycle.Bat) &&
                                      !hasBids
                                    ? 'No offers yet...'
                                    : lifecycle === Lifecycle.Bench
                                    ? 'Place offer to begin auction'
                                    : lifecycle === Lifecycle.Shower
                                    ? 'Winner '
                                    : 'oops shouldnt be here'}
                            </Text>
                            {hasBids && (
                                <div
                                    style={
                                        styles[
                                            screenType !== 'desktop'
                                                ? 'leadingOfferContainerMobile'
                                                : 'leadingOfferContainer'
                                        ]
                                    }
                                >
                                    {leader ? (
                                        <animated.div
                                            // @ts-ignore
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
                                                hash={leader && leader.txhash}
                                                isNugg={type === Route.SwapItem}
                                            />
                                        </animated.div>
                                    ) : null}
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
                    )}
                </div>
            </div>
            {/* //@ts-ignore */}
            <animated.div style={springStyle}>
                <Text textStyle={{ marginBottom: '1rem' }}>Previous offers</Text>
                {offers &&
                    provider &&
                    chainId &&
                    offers.map(
                        (offer, index) =>
                            index !== 0 && (
                                // eslint-disable-next-line no-use-before-define
                                <OfferRenderItem
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={index}
                                    provider={provider}
                                    offer={offer}
                                    // index={index}
                                    chainId={chainId}
                                    token={token}
                                />
                            ),
                    )}
            </animated.div>

            {lifecycle !== 'shower' && (screenType === 'phone' || address) && (
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
                            : tokenId &&
                              AppState.dispatch.setModalOpen({
                                  name: 'OfferModal',
                                  modalData: {
                                      targetId: tokenId,
                                      type: type === Route.SwapItem ? 'OfferItem' : 'OfferNugg',
                                      data: {
                                          tokenId,
                                          token,
                                          mustPickNuggToBuyFrom: lifecycle === 'tryout',
                                      },
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
    ) : token ? (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
            {token.type === 'item' ? (
                <Text>this item is owned by ___ nuggs and is not currently for sale</Text>
            ) : (
                <Text>This nugg is happily owned by {token.owner}</Text>
            )}
        </>
    ) : null;
};

export default React.memo(RingAbout);

const OfferRenderItem = ({
    provider,
    chainId,
    offer,
    token,
}: {
    provider: Web3Provider;
    chainId: Chain;
    offer: OfferData;
    token: LiveNugg | LiveItem | undefined;
    // index: number;
}) => {
    const leader =
        !token || token.type === 'item'
            ? undefined
            : web3.hook.usePriorityAnyENSName(provider, offer.user);
    return (
        <div style={styles.offerAmount}>
            <CurrencyText image="eth" value={offer.eth.decimal.toNumber()} />
            {leader ? (
                <InteractiveText
                    type="text"
                    size="smaller"
                    textStyle={{ color: Colors.textColor }}
                    action={() => {
                        web3.config.gotoEtherscan(chainId, 'tx', offer.txhash);
                    }}
                >
                    {leader}
                </InteractiveText>
            ) : null}
        </div>
    );
};
