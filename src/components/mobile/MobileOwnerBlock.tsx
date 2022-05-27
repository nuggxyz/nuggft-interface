import React from 'react';
import { t, plural } from '@lingui/macro';

import client from '@src/client';
import { Lifecycle } from '@src/client/interfaces';
import lib from '@src/lib';
import TheRing from '@src/components/nugg/TheRing/TheRing';
import useLifecycleEnhanced from '@src/client/hooks/useLifecycleEnhanced';
import Text from '@src/components/general/Texts/Text/Text';
import { Address } from '@src/classes/Address';
import { EthInt } from '@src/classes/Fraction';
import { useUsdPair } from '@src/client/usd';
import useAsyncState from '@src/hooks/useAsyncState';
import useAggregatedOffers from '@src/client/hooks/useAggregatedOffers';
import { useNuggftV1 } from '@src/contracts/useContract';
import web3 from '@src/web3';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import { useRemainingTrueSeconds } from '@src/client/hooks/useRemaining';
import Label from '@src/components/general/Label/Label';

const MobileOwnerBlock = ({
    tokenId,
    visible,
    lifecycle,
}: {
    tokenId?: TokenId;
    visible?: boolean;
    lifecycle: ReturnType<typeof useLifecycleEnhanced>;
}) => {
    const token = client.live.token(tokenId);

    const swap = client.swaps.useSwap(tokenId);

    const [leader, ...offers] = useAggregatedOffers(visible ? tokenId : undefined);

    const provider = web3.hook.usePriorityProvider();

    const { minutes, seconds } = client.epoch.useEpoch(swap?.epoch?.id);

    const trueSeconds = useRemainingTrueSeconds(seconds ?? 0);
    // const provider = web3.hook.usePriorityProvider();
    const nuggft = useNuggftV1(provider);

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

    const vfo = useAsyncState(() => {
        if (
            visible &&
            token &&
            provider &&
            tokenId &&
            lifecycle?.lifecycle === Lifecycle.Bunt &&
            !leader?.eth
        ) {
            const check = nuggft['vfo(address,uint24)'].bind(undefined, Address.NULL.hash);
            return check(tokenId.toRawId()).then((x) => {
                if (x.isZero()) return nuggft.msp();
                return x;
            });
        }
        return undefined;
    }, [visible, token, nuggft, tokenId, provider, leader?.eth]);

    const leaderCurrency = useUsdPair(leader?.eth || vfo || 0);

    const currencyData = React.useMemo(() => {
        if (leader && lifecycle?.lifecycle === Lifecycle.Bench) {
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
                ? `${leaderEns || leader?.account || ''} is leading`
                : 'now',
            subtext:
                offers.length !== 0 &&
                plural(offers.length, {
                    1: '# other bidder',
                    other: '# other bidders',
                }),
            user: leaderEns || leader?.account || 'minting',
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
                // boxShadow: `0px 1px 3px ${lib.colors.shadowNuggBlue}`,
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
                    marginTop: -25,
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
                    // width: '95%',
                    display: 'flex',
                    // width: '90%',
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
                    // width: '95%',
                    display: 'flex',
                    // width: '90%',
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
                    // width: '95%',
                    display: 'flex',
                    // width: '90%',
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
                {' '}
                <Text textStyle={{ fontSize: '13px', color: lib.colors.primaryColor }}>
                    {currencyData.text}
                </Text>
                <Text
                    textStyle={{
                        color: lib.colors.primaryColor,

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
                        // width: '95%',
                        display: 'flex',
                        // width: '90%',
                        margin: 'auto',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        alignItems: 'center',
                        // background: lib.colors.transparentWhite,
                        // WebkitBackdropFilter: 'blur(50px)',
                        // backdropFilter: 'blur(50px)',
                        padding: '.5rem .8rem',
                    }}
                >
                    {' '}
                    <Text
                        textStyle={{
                            color: lib.colors.primaryColor,
                            fontWeight: lib.layout.fontWeight.thicc,
                            fontSize: '26px',
                        }}
                    >
                        {!minutes ? trueSeconds ?? 0 : minutes}
                    </Text>
                    <Text
                        textStyle={{
                            marginTop: -3,
                            color: lib.colors.primaryColor,
                            fontWeight: lib.layout.fontWeight.semibold,

                            fontSize: '13px',
                        }}
                    >
                        {!minutes ? 'sec' : 'min'}
                    </Text>
                </div>
            ) : (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        // width: '95%',
                        display: 'flex',
                        // width: '90%',
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

            {/* {swap && lifecycle?.lifecycle === Lifecycle.Stands && (
                <>
                    <Text
                        textStyle={{
                            color: dynamicTextColor,
                        }}
                    >
                        {swap.type === 'item'
                            ? t`this item is owned by ${99999} nuggs and is not currently for sale`
                            : t`Nugg ${tokenId} is happily owned by`}
                    </Text>

                    {swap.type === 'nugg' && (
                        <Text
                            textStyle={{
                                marginTop: '15px',
                                color: dynamicTextColor,
                                fontSize: '32px',
                            }}
                        >
                            {leaderEns}
                        </Text>
                    )}
                </>
            )}
            {swap && lifecycle?.lifecycle === Lifecycle.Cut && (
                <Text
                    textStyle={{
                        color: dynamicTextColor,
                    }}
                >
                    {t`Unfortuantly, Nugg ${tokenId} did not make it. --- this should not show up and we need to fix this`}
                </Text>
            )} */}
            {/* {token && lifecycle !== Lifecycle.Stands && lifecycle !== Lifecycle.Cut && (
            // @danny7even is this logic okay, shoud be same as before but less conditional
            rerendering, i think */}

            {/* <div
                style={{
                    display: 'flex',
                    width: '100%',
                    flexDirection: 'column',
                    zIndex: 2000000,
                    marginTop: -40,
                }}
            >
                <div
                    style={{
                        // width: '95%',
                        display: 'flex',
                        // width: '90%',
                        margin: 'auto',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: lib.colors.transparentWhite,
                        borderRadius: lib.layout.borderRadius.medium,
                        WebkitBackdropFilter: 'blur(50px)',
                        backdropFilter: 'blur(50px)',
                        padding: '.7rem .8rem',
                    }}
                >
                    <Text
                        textStyle={{
                            color: lib.colors.primaryColor,
                            borderRadius: lib.layout.borderRadius.large,
                        }}
                        size="larger"
                    >
                        {tokenId && tokenId.toPrettyId()}
                    </Text>
                    {lifecycle && (
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
                            text={
                                lifecycle.active
                                    ? !minutes
                                        ? `ends in about ${plural(trueSeconds ?? 0, {
                                              other: '# sec',
                                          })}`
                                        : `ends in about ${plural(minutes, {
                                              other: '# min',
                                          })}`
                                    : lifecycle?.label
                            }
                            leftDotColor={lifecycle.color}
                        />
                    )}
                </div>
            </div> */}

            {/* <div
                style={{
                    marginTop: -10,
                    height: '100%',
                    justifyContent: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <CurrencyText
                    textStyle={{ color: dynamicTextColor, fontSize: '35px' }}
                    image="eth"
                    stopAnimationOnStart
                    value={currencyData.currency}
                    decimals={3}
                    loadingOnZero
                />
                <Text textStyle={{ fontSize: '13px', color: dynamicTextColor }}>
                    {currencyData.text}
                </Text>
                {currencyData.subtext && (
                    <Text
                        textStyle={{
                            fontSize: '13px',
                            color: dynamicTextColor,
                            ...lib.layout.presets.font.main.light,
                        }}
                    >
                        {currencyData.subtext}
                    </Text>
                )}
            </div> */}
            {/* <div
                style={{
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {lifecycle &&
                    (!lifecycle.active ? (
                        <></>
                    ) : (
                        // <Label
                        //     // type="text"
                        //     containerStyles={{
                        //         background: 'transparent',
                        //     }}
                        //     size="small"
                        //     textStyle={{
                        //         color: dynamicTextColor,

                        //         position: 'relative',
                        //     }}
                        //     text={lifecycle?.label}
                        //     leftDotColor={lifecycle.color}
                        // />
                        <div style={{}}>
                            <Text textStyle={{ color: dynamicTextColor }}>
                                ends in about{' '}
                                {!minutes
                                    ? `${plural(trueSeconds ?? 0, {
                                          other: '# sec',
                                      })}`
                                    : `${plural(minutes, {
                                          other: '# min',
                                      })}`}
                            </Text>
                        </div>
                    ))}
            </div> */}
        </div>
    );
};

export default React.memo(
    MobileOwnerBlock,
    (a, b) =>
        (b.tokenId === undefined || a.tokenId === b.tokenId) &&
        a.visible === b.visible &&
        a.lifecycle?.lifecycle === b.lifecycle?.lifecycle,
);
