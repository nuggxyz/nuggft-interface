/* eslint-disable react/require-default-props */
import React from 'react';
import { t, plural } from '@lingui/macro';

import client from '@src/client';
import lib from '@src/lib';
import { useRemainingBlocks } from '@src/components/nugg/TheRing/TheRing';
import Text from '@src/components/general/Texts/Text/Text';
import { EthInt } from '@src/classes/Fraction';
import { useUsdPair } from '@src/client/usd';
import web3 from '@src/web3';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import { useRemainingTrueSeconds } from '@src/client/hooks/useRemaining';
import Label from '@src/components/general/Label/Label';
import { MIN_SALE_PRICE } from '@src/web3/constants';
import TheRingLight from '@src/components/nugg/TheRing/TheRingLight';

export default React.memo<{ tokenId?: TokenId; visible?: boolean }>(
    ({ tokenId, visible }) => {
        const swap = client.v2.useSwap(tokenId);
        const potential = client.v3.useSwap(tokenId);

        const provider = web3.hook.usePriorityProvider();

        const blocknum = client.block.useBlock();

        const [remaining] = useRemainingBlocks(blocknum, swap?.commitBlock, swap?.endingEpoch);
        const trueSeconds = useRemainingTrueSeconds(remaining * 12);
        const minutes = Math.floor((remaining * 12) / 60);
        const leaderEns = web3.hook.usePriorityAnyENSName(
            tokenId?.isItemId() ? 'nugg' : provider,
            swap?.leader || potential?.owner || undefined,
        );

        const dynamicTextColor = React.useMemo(() => {
            if (swap === null) {
                return lib.colors.primaryColor;
            }
            return lib.colors.white;
        }, [swap]);

        const minTryoutCurrency = useUsdPair(
            swap?.isItem()
                ? swap.top
                : potential
                ? potential.min?.eth || MIN_SALE_PRICE
                : MIN_SALE_PRICE,
        );

        const msp = client.stake.useMsp();

        const leaderCurrency = useUsdPair(
            swap
                ? swap.top.gt(0)
                    ? swap.top
                    : msp
                : potential
                ? potential.min?.eth.gt(0)
                    ? potential.min?.eth
                    : msp
                : 0,
        );

        const currencyData = React.useMemo(() => {
            if (potential && tokenId?.isNuggId() && !swap) {
                return {
                    currency: leaderCurrency,
                    text: `seller`,
                    user: leaderEns || potential.owner || '',
                };
            }
            if (potential && potential.isItem()) {
                return {
                    currency: minTryoutCurrency,
                    text: t`being sold by`,
                    user: plural(potential.count, {
                        1: '# nugg',
                        other: '# nuggs',
                    }),
                };
            }
            if (!swap) return undefined;
            return {
                currency: leaderCurrency,
                text: new EthInt(swap?.top || potential?.min?.eth || 0).number
                    ? (swap?.numOffers || 0) > 1
                        ? t`leader of ${swap?.numOffers || 0} bidders`
                        : t`leader`
                    : t`live`,
                subtext:
                    (swap?.numOffers || 0) !== 0 &&
                    plural(swap?.numOffers || 0, {
                        1: '# other bidder',
                        other: '# other bidders',
                    }),
                user: leaderEns || swap.leader || t`minting`,
            };
        }, [leaderCurrency, minTryoutCurrency, leaderEns, swap, potential, tokenId]);

        return (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '.1rem',
                    marginBottom: 0,
                    textAlign: 'center',
                    position: 'relative',
                }}
            >
                <div
                    style={{
                        width: '100%',
                        minHeight: '300px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: -15,
                    }}
                >
                    <TheRingLight
                        circleWidth={935}
                        manualTokenId={tokenId}
                        disableHover
                        disableClick
                        defaultColor={dynamicTextColor}
                        tokenStyle={{ width: '275px', height: '275px' }}
                    />
                </div>
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        display: 'flex',
                        margin: 'auto',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: lib.colors.transparentWhite,
                        borderRadius: lib.layout.borderRadius.mediumish,
                        WebkitBackdropFilter: 'blur(50px)',
                        backdropFilter: 'blur(50px)',
                        padding: '.5rem .8rem',
                    }}
                >
                    <Text
                        textStyle={{
                            color: lib.colors.primaryColor,
                            fontWeight: lib.layout.fontWeight.thicc,
                        }}
                    >
                        {tokenId && tokenId.toPrettyId()}
                    </Text>
                </div>
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        display: 'flex',
                        margin: 'auto',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        alignItems: 'center',
                        background: lib.colors.transparentWhite,
                        borderRadius: lib.layout.borderRadius.mediumish,
                        WebkitBackdropFilter: 'blur(50px)',
                        backdropFilter: 'blur(50px)',
                        padding: '.5rem .6rem',
                    }}
                >
                    <CurrencyText
                        textStyle={{
                            color: lib.colors.primaryColor,
                            fontSize: '30px',
                            display: 'flex',
                            alignItems: 'flex-end',
                            fontWeight: lib.layout.fontWeight.semibold,
                        }}
                        image="eth"
                        stopAnimationOnStart
                        value={currencyData?.currency || 0}
                        decimals={3}
                        loadingOnZero
                        unitStyle={{
                            fontSize: '18px',
                            paddingBottom: 4,
                            marginLeft: -2,
                            fontWeight: lib.layout.fontWeight.medium,
                        }}
                    />
                </div>

                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        display: 'flex',
                        margin: 'auto',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        background: lib.colors.transparentWhite,
                        borderRadius: lib.layout.borderRadius.mediumish,
                        WebkitBackdropFilter: 'blur(50px)',
                        backdropFilter: 'blur(50px)',
                        padding: '.5rem .8rem',
                    }}
                >
                    <Text textStyle={{ fontSize: '13px', color: lib.colors.primaryColor }}>
                        {currencyData?.text}
                    </Text>
                    <Text
                        textStyle={{
                            color: lib.colors.primaryColor,
                            fontSize: '15px',
                            fontWeight: lib.layout.fontWeight.semibold,
                        }}
                    >
                        {currencyData?.user}
                    </Text>
                </div>
                {swap && swap.commitBlock !== 0 ? (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            background: lib.colors.transparentWhite,
                            borderRadius: lib.layout.borderRadius.mediumish,
                            WebkitBackdropFilter: 'blur(50px)',
                            backdropFilter: 'blur(50px)',
                            right: 0,
                            display: 'flex',
                            margin: 'auto',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '.5rem .8rem',
                        }}
                    >
                        <Text
                            textStyle={{
                                color: lib.colors.primaryColor,
                                fontWeight: lib.layout.fontWeight.thicc,
                                fontSize: '26px',
                            }}
                        >
                            {!minutes ? trueSeconds ?? '0' : minutes}
                        </Text>
                        <Text
                            textStyle={{
                                marginTop: -3,
                                color: lib.colors.primaryColor,
                                fontWeight: lib.layout.fontWeight.semibold,

                                fontSize: '13px',
                            }}
                        >
                            {!minutes ? t`sec` : t`min`}
                        </Text>
                    </div>
                ) : (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            display: 'flex',
                            margin: 'auto',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            alignItems: 'center',
                            background: lib.colors.transparentWhite,
                            borderRadius: lib.layout.borderRadius.mediumish,
                            WebkitBackdropFilter: 'blur(50px)',
                            backdropFilter: 'blur(50px)',
                            padding: '.5rem .8rem',
                        }}
                    >
                        <Label
                            // type="text"
                            containerStyles={{
                                background: 'transparent',
                            }}
                            size="small"
                            textStyle={{
                                color: lib.colors.primaryColor,
                                position: 'relative',
                            }}
                            text={swap ? 'about to start' : 'waiting on bid'}
                            leftDotColor={swap ? lib.colors.green : lib.colors.nuggGold}
                        />
                    </div>
                )}
            </div>
        );
    },

    (a, b) => (b.tokenId === undefined || a.tokenId === b.tokenId) && a.visible === b.visible,
);
