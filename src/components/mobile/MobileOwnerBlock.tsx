import React from 'react';
import { plural, t } from '@lingui/macro';

import Text from '@src/components/general/Texts/Text/Text';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import client from '@src/client';
import { Lifecycle } from '@src/client/interfaces';
import lib from '@src/lib';
import { useDarkMode } from '@src/client/hooks/useDarkMode';
import web3 from '@src/web3';
import TheRing from '@src/components/nugg/TheRing/TheRing';
import { useUsdPair } from '@src/client/usd';
import useAggregatedOffers from '@src/client/hooks/useAggregatedOffers';
import useLifecycleEnhanced from '@src/client/hooks/useLifecycleEnhanced';
import useAsyncState from '@src/hooks/useAsyncState';
import { useNuggftV1 } from '@src/contracts/useContract';
import { Address } from '@src/classes/Address';
import useRemaining, { useRemainingTrueSeconds } from '@src/client/hooks/useRemaining';
import Label from '@src/components/general/Label/Label';
import { EthInt } from '@src/classes/Fraction';

const MobileOwnerBlock = ({ tokenId }: { tokenId?: TokenId }) => {
    const token = client.live.token(tokenId);

    const swap = client.swaps.useSwap(tokenId);

    const darkmode = useDarkMode();

    const [leader, ...offers] = useAggregatedOffers(tokenId);

    const { minutes, seconds } = useRemaining(swap?.epoch);

    const trueSeconds = useRemainingTrueSeconds(seconds);
    const provider = web3.hook.usePriorityProvider();
    const nuggft = useNuggftV1(provider);

    const leaderEns = web3.hook.usePriorityAnyENSName(
        swap && swap.type === 'item' ? 'nugg' : provider,
        leader?.account || '',
    );

    const lifecycle = useLifecycleEnhanced(swap, token);

    const dynamicTextColor = React.useMemo(() => {
        if (swap?.endingEpoch === null || lifecycle?.lifecycle === Lifecycle.Egg) {
            return lib.colors.primaryColor;
        }
        return lib.colors.white;
    }, [swap, lifecycle]);

    const minTryoutCurrency = useUsdPair(token?.isItem() ? token?.tryout.min?.eth : undefined);

    const vfo = useAsyncState(() => {
        if (token && provider && tokenId && lifecycle?.lifecycle === Lifecycle.Bunt) {
            const check = nuggft['vfo(address,uint24)'].bind(undefined, Address.NULL.hash);
            return check(tokenId.toRawId()).then((x) => {
                if (x.isZero()) return nuggft.msp();
                return x;
            });
        }
        return undefined;
    }, [token, nuggft, tokenId, provider]);

    const leaderCurrency = useUsdPair(leader?.eth || vfo || 0);

    return (
        <div
            style={{
                width: '100%',
                // background: lib.colors.transparentWhite,
                // borderRadius: lib.layout.borderRadius.medium,
                padding: '.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '.1rem',
                marginBottom: 0,
                // boxShadow: `0px 1px 3px ${lib.colors.shadowNuggBlue}`,
                textAlign: 'center',
            }}
        >
            {swap && lifecycle?.lifecycle === Lifecycle.Stands && (
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
            )}
            {/* {token && lifecycle !== Lifecycle.Stands && lifecycle !== Lifecycle.Cut && (
            // @danny7even is this logic okay, shoud be same as before but less conditional
            rerendering, i think */}
            <div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        alignItems: 'center',
                    }}
                >
                    <Text
                        textStyle={{
                            color: dynamicTextColor,
                            padding: '1rem',
                            background: darkmode
                                ? lib.colors.nuggBlueTransparent
                                : lib.colors.transparentGrey,
                            borderRadius: lib.layout.borderRadius.medium,
                            fontSize: '23px',
                        }}
                    >
                        {tokenId && tokenId.toPrettyId()}
                    </Text>

                    {leader && lifecycle?.lifecycle === Lifecycle.Bench ? (
                        <div
                            style={{
                                alignItems: 'flex-end',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <CurrencyText
                                textStyle={{ color: dynamicTextColor, fontSize: '28px' }}
                                image="eth"
                                stopAnimationOnStart
                                value={leaderCurrency}
                                decimals={3}
                                loadingOnZero
                            />
                            <Text textStyle={{ fontSize: '13px', color: dynamicTextColor }}>
                                {`${leaderEns || leader?.account || ''} is selling`}
                            </Text>
                        </div>
                    ) : lifecycle?.lifecycle === Lifecycle.Tryout &&
                      token &&
                      token.type === 'item' &&
                      token.tryout.min ? (
                        <div
                            style={{
                                alignItems: 'flex-end',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <CurrencyText
                                textStyle={{ color: dynamicTextColor, fontSize: '28px' }}
                                image="eth"
                                stopAnimationOnStart
                                value={minTryoutCurrency}
                                decimals={3}
                                loadingOnZero
                            />
                            <Text textStyle={{ fontSize: '13px', color: dynamicTextColor }}>
                                {t`minimum price`}
                            </Text>
                        </div>
                    ) : (
                        <div
                            style={{
                                alignItems: 'flex-end',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <CurrencyText
                                textStyle={{ color: dynamicTextColor, fontSize: '28px' }}
                                image="eth"
                                stopAnimationOnStart
                                value={leaderCurrency}
                                decimals={3}
                                loadingOnZero
                            />
                            <Text textStyle={{ fontSize: '13px', color: dynamicTextColor }}>
                                {`${
                                    new EthInt(leader?.eth || 0).number
                                        ? `${leaderEns || leader?.account || ''} is leading`
                                        : 'starting price'
                                }`}
                            </Text>
                            <Text
                                textStyle={{
                                    fontSize: '13px',
                                    color: dynamicTextColor,
                                    fontFamily: lib.layout.font.sf.light,
                                }}
                            >
                                {offers &&
                                    offers.length !== 0 &&
                                    plural(offers.length, {
                                        1: '# other bidder',
                                        other: '# other bidders',
                                    })}
                            </Text>
                        </div>
                    )}

                    {/*
<div
                            style={{
                                alignItems: 'flex-end',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <Text textStyle={{ fontSize: '13px', color: dynamicTextColor }}>
                                ending in about
                            </Text>
                            <Text textStyle={{ color: dynamicTextColor, fontSize: '28px' }}>
                                {' '}
                                {minutes === 0
                                    ? `${plural(trueSeconds, {
                                          1: '# second',
                                          other: '# seconds',
                                      })}`
                                    : `${plural(minutes, {
                                          1: '# minute',
                                          other: '# minutes',
                                      })}`}
                            </Text>
                        </div> */}
                </div>
                <div
                    style={{
                        width: '100%',
                        height: '300px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        // marginBottom: '20px',
                    }}
                >
                    <TheRing
                        circleWidth={800}
                        manualTokenId={swap?.tokenId}
                        disableHover
                        disableClick
                        defaultColor={dynamicTextColor}
                        tokenStyle={{ width: '200px', height: '200px' }}
                    />
                </div>
            </div>

            <div
                style={{
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    // marginTop: '-20px',
                }}
            >
                {lifecycle &&
                    (!lifecycle.active ? (
                        <Label
                            // type="text"
                            containerStyles={{
                                background: 'transparent',
                            }}
                            size="small"
                            textStyle={{
                                color: dynamicTextColor,

                                position: 'relative',
                            }}
                            text={lifecycle?.label}
                            leftDotColor={lifecycle.color}
                        />
                    ) : (
                        <>
                            <Text textStyle={{ fontSize: '13px', color: dynamicTextColor }}>
                                ending in about
                            </Text>
                            <Text textStyle={{ color: dynamicTextColor, fontSize: '28px' }}>
                                {' '}
                                {minutes === 0
                                    ? `${plural(trueSeconds, {
                                          1: '# second',
                                          other: '# seconds',
                                      })}`
                                    : `${plural(minutes, {
                                          1: '# minute',
                                          other: '# minutes',
                                      })}`}
                            </Text>
                        </>
                    ))}
            </div>
            {/* )} */}
        </div>
    );
};

export default React.memo(MobileOwnerBlock);

// const ens = web3.hook.usePriorityAnyENSName(
//     token?.type === 'item' ? 'nugg' : provider,
//     token
//         ? token.activeSwap
//             ? token.activeSwap.owner
//             : token.type === 'nugg'
//             ? token.owner
//             : ''
//         : '',
// );

// @danny7even what is the purpose of this? bypassing it fixes a small rendering delay
//   which makes the ring about not appear as jumpy on first render
// const isItemTryout = useCallback(
//     (_token?: LiveToken | null): _token is RecursiveRequired<LiveItem> =>
//         !isUndefinedOrNullOrBooleanFalse(
//             lifecycle === Lifecycle.Tryout &&
//                 _token &&
//                 _token.type === 'item' &&
//                 !isUndefinedOrNullOrObjectEmpty(_token.tryout.min) &&
//                 !isUndefinedOrNullOrObjectEmpty(_token.tryout.max),
//         ),
//     [lifecycle],
// );

// {
// /* <div style={{ display: 'flex', marginTop: '20px' }}>
//                     <Text
//                         size="small"
//                         textStyle={{
//                             fontFamily: lib.layout.font.sf.light,
//                             marginRight: '5px',
//                         }}
//                     >
//                         Current Price |{' '}
//                     </Text>
//                     <CurrencyText
//                         size="small"
//                         value={Math.max(
//                             floor?.decimal.toNumber() || 0,
//                             token && token.activeSwap ? token.activeSwap?.eth.number : 0,
//                         )}
//                     />
//                 </div> */
// }
