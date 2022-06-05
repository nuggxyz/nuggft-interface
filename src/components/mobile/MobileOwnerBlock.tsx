import React from 'react';
import { t, plural } from '@lingui/macro';

import client from '@src/client';
import { Lifecycle } from '@src/client/interfaces';
import lib from '@src/lib';
import TheRing from '@src/components/nugg/TheRing/TheRing';
import useLifecycleEnhanced from '@src/client/hooks/useLifecycleEnhanced';
import Text from '@src/components/general/Texts/Text/Text';
import { EthInt } from '@src/classes/Fraction';
import { useUsdPair } from '@src/client/usd';
import useAggregatedOffers from '@src/client/hooks/useAggregatedOffers';
import web3 from '@src/web3';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import { useRemainingTrueSeconds } from '@src/client/hooks/useRemaining';
import Label from '@src/components/general/Label/Label';

export default React.memo<{ tokenId?: TokenId; visible?: boolean }>(
    ({ tokenId, visible }) => {
        const token = client.live.token(tokenId);

        const swap = client.swaps.useSwap(tokenId);

        const lifecycle = useLifecycleEnhanced(visible ? swap : undefined);

        const [leader, ...offers] = useAggregatedOffers(visible ? tokenId : undefined);

        const provider = web3.hook.usePriorityProvider();

        const { minutes, seconds } = client.epoch.useEpoch(swap?.epoch?.id);

        const trueSeconds = useRemainingTrueSeconds(seconds ?? 0);

        const leaderEns = web3.hook.usePriorityAnyENSName(
            swap && swap.type === 'item' ? 'nugg' : provider,
            leader?.account || '',
        );

        const dynamicTextColor = React.useMemo(() => {
            if (swap?.endingEpoch === null || lifecycle?.lifecycle === Lifecycle.Egg) {
                return lib.colors.primaryColor;
            }
            return lib.colors.white;
        }, [swap, lifecycle]);

        const minTryoutCurrency = useUsdPair(token?.isItem() ? token?.tryout.min?.eth : undefined);

        const msp = client.stake.useMsp();

        const leaderCurrency = useUsdPair(
            leader?.eth.gt(0)
                ? leader.eth
                : lifecycle?.lifecycle === Lifecycle.Bunt ||
                  lifecycle?.lifecycle === Lifecycle.Minors
                ? msp
                : 0,
        );

        const currencyData = React.useMemo(() => {
            if (
                leader &&
                (lifecycle?.lifecycle === Lifecycle.Bench ||
                    lifecycle?.lifecycle === Lifecycle.Minors)
            ) {
                return {
                    currency: leaderCurrency,
                    text: `seller`,
                    user: leaderEns || leader?.account || '',
                };
            }
            if (
                lifecycle?.lifecycle === Lifecycle.Tryout &&
                token &&
                token.isItem() &&
                token.tryout.min
            ) {
                return {
                    currency: minTryoutCurrency,
                    text: t`being sold by`,
                    user: token.tryout.count === 1 ? swap?.leader : `${token.tryout.count} Nuggs`,
                };
            }
            return {
                currency: leaderCurrency,
                text: new EthInt(leader?.eth || 0).number
                    ? offers.length > 1
                        ? t`leader of ${offers.length} bidders`
                        : t`leader`
                    : t`live`,
                subtext:
                    offers.length !== 0 &&
                    plural(offers.length, {
                        1: '# other bidder',
                        other: '# other bidders',
                    }),
                user: leaderEns || leader?.account || t`minting`,
            };
        }, [
            leaderCurrency,
            minTryoutCurrency,
            offers.length,
            leaderEns,
            leader,
            lifecycle?.lifecycle,
            token,
            swap?.leader,
        ]);

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
                    <TheRing
                        circleWidth={935}
                        manualTokenId={swap?.tokenId}
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
                        value={currencyData.currency}
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
                        {currencyData.text}
                    </Text>
                    <Text
                        textStyle={{
                            color: lib.colors.primaryColor,
                            fontSize: '15px',
                            fontWeight: lib.layout.fontWeight.semibold,
                        }}
                    >
                        {currencyData.user}
                    </Text>
                </div>
                {lifecycle?.active ? (
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
                            text={lifecycle?.label ?? ''}
                            leftDotColor={lifecycle?.color}
                        />
                    </div>
                )}
            </div>
        );
    },

    (a, b) => (b.tokenId === undefined || a.tokenId === b.tokenId) && a.visible === b.visible,
);
