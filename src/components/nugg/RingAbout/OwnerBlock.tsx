import React, { FC } from 'react';
import { plural, t } from '@lingui/macro';

import useLifecycle from '@src/client/hooks/useLifecycle';
import { useRemainingTrueSeconds } from '@src/client/hooks/useRemaining';
import Text from '@src/components/general/Texts/Text/Text';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import client from '@src/client';
import { Lifecycle, LiveNuggItem } from '@src/client/interfaces';
import lib from '@src/lib';
import { useDarkMode } from '@src/client/hooks/useDarkMode';
import List, { ListRenderItemProps } from '@src/components/general/List/List';
import TokenViewer from '@src/components/nugg/TokenViewer';
import web3 from '@src/web3';
import TheRing from '@src/components/nugg/TheRing/TheRing';
import useDimensions from '@src/client/hooks/useDimensions';
import { useUsdPair } from '@src/client/usd';

const RenderItem: FC<ListRenderItemProps<LiveNuggItem, undefined, LiveNuggItem>> = ({ item }) => {
    return (
        <div
            style={{
                borderRadius: lib.layout.borderRadius.medium,
                transition: '.2s background ease',
            }}
        >
            <TokenViewer tokenId={item.tokenId} style={{ width: '60px', height: '60px' }} />
        </div>
    );
};

const OwnerBlock = ({ tokenId }: { tokenId?: TokenId }) => {
    const token = client.live.token(tokenId);

    const swap = client.swaps.useSwap(tokenId);

    const lifecycle = useLifecycle(swap);

    const leader = React.useMemo(() => {
        return { user: swap?.leader, eth: swap?.eth };
    }, [swap]);

    const darkmode = useDarkMode();

    const blocknum = client.block.useBlock();

    const { minutes, seconds } = client.epoch.useEpoch(swap?.epoch?.id, blocknum);

    const trueSeconds = useRemainingTrueSeconds(seconds ?? 0);
    const provider = web3.hook.usePriorityProvider();

    const leaderEns = web3.hook.usePriorityAnyENSName(
        swap && swap.type === 'item' ? 'nugg' : provider,
        leader?.user || '',
    );
    const { screen: screenType, isPhone } = useDimensions();

    const dynamicTextColor = React.useMemo(() => {
        if (isPhone && swap?.endingEpoch === null) {
            return lib.colors.primaryColor;
        }
        return lib.colors.white;
    }, [swap, isPhone]);

    const leaderCurrency = useUsdPair(leader?.eth);
    const minTryoutCurrency = useUsdPair(token?.isItem() ? token?.tryout.min?.eth : undefined);

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
                marginBottom: isPhone ? 0 : '.5rem',
                // boxShadow: `0px 1px 3px ${lib.colors.shadowNuggBlue}`,
                textAlign: 'center',
            }}
        >
            {swap && lifecycle === Lifecycle.Stands && (
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
            {swap && lifecycle === Lifecycle.Cut && (
                <Text
                    textStyle={{
                        color: dynamicTextColor,
                    }}
                >
                    {t`Unfortuantly, Nugg ${tokenId} did not make it.`}
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

                    {leader && lifecycle === Lifecycle.Bench ? (
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
                                value={leaderCurrency}
                                decimals={3}
                            />
                            <Text textStyle={{ fontSize: '13px', color: dynamicTextColor }}>
                                {`${leaderEns || leader?.user || ''} is selling`}
                            </Text>
                        </div>
                    ) : lifecycle === Lifecycle.Tryout &&
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
                                value={minTryoutCurrency}
                                decimals={3}
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
                            <Text textStyle={{ fontSize: '13px', color: dynamicTextColor }}>
                                ending in about
                            </Text>
                            <Text textStyle={{ color: dynamicTextColor, fontSize: '28px' }}>
                                {' '}
                                {!minutes
                                    ? `${plural(trueSeconds ?? 0, {
                                          1: '# second',
                                          other: '# seconds',
                                      })}`
                                    : `${plural(minutes, {
                                          1: '# minute',
                                          other: '# minutes',
                                      })}`}
                            </Text>
                        </div>
                    )}
                </div>
                {screenType === 'phone' && (
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
                            defaultColor={isPhone ? dynamicTextColor : lib.colors.nuggBlue}
                            tokenStyle={{ width: '200px', height: '200px' }}
                        />
                    </div>
                )}
                {token && token.type === 'nugg' && !isPhone && (
                    <List
                        data={token.items}
                        labelStyle={{
                            color: dynamicTextColor,
                        }}
                        extraData={undefined}
                        RenderItem={RenderItem}
                        horizontal
                        style={{
                            // width: '100%',
                            marginTop: screenType === 'phone' ? '-20px' : '20px',
                            background: lib.colors.transparentLightGrey,
                            height: '80px',
                            padding: '0rem .3rem',
                            borderRadius: lib.layout.borderRadius.medium,
                        }}
                    />
                )}
            </div>
            {/* )} */}
        </div>
    );
};

export default React.memo(OwnerBlock);

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
