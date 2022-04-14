import React, { FC } from 'react';
import { plural, t } from '@lingui/macro';

import useLifecycle from '@src/client/hooks/useLifecycle';
import useRemaining from '@src/client/hooks/useRemaining';
import Text from '@src/components/general/Texts/Text/Text';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import client from '@src/client';
import { Lifecycle, LiveNuggItem, OfferData } from '@src/client/interfaces';
import lib, { parseTokenIdSmart } from '@src/lib';
import { useDarkMode } from '@src/client/hooks/useDarkMode';
import List, { ListRenderItemProps } from '@src/components/general/List/List';
import TokenViewer from '@src/components/nugg/TokenViewer';
import web3 from '@src/web3';
import TheRing from '@src/components/nugg/TheRing/TheRing';
import useDimentions from '@src/client/hooks/useDimentions';

import styles from './RingAbout.styles';

const RenderItem: FC<ListRenderItemProps<LiveNuggItem, undefined, LiveNuggItem>> = ({ item }) => {
    return (
        <div
            style={{
                borderRadius: lib.layout.borderRadius.medium,
                transition: '.2s background ease',
            }}
        >
            <TokenViewer tokenId={item.id} style={{ width: '60px', height: '60px' }} />
        </div>
    );
};

const OwnerBlock = ({ tokenId }: { tokenId?: string }) => {
    const token = client.live.token(tokenId);
    const lifecycle = useLifecycle(token);
    const leader = client.live.offers(tokenId).first() as unknown as OfferData;

    const darkmode = useDarkMode();

    const { minutes } = useRemaining(token?.activeSwap?.epoch);
    const provider = web3.hook.usePriorityProvider();

    const leaderEns = web3.hook.usePriorityAnyENSName(
        token && token.type === 'item' ? 'nugg' : provider,
        leader?.user || '',
    );
    const { screen: screenType } = useDimentions();

    return (
        <div style={styles.ownerBlockContainer}>
            {token && lifecycle === Lifecycle.Stands && (
                <>
                    <Text
                        textStyle={{
                            color: lib.colors.white,
                        }}
                    >
                        {token.type === 'item'
                            ? t`this item is owned by ${99999} nuggs and is not currently for sale`
                            : t`Nugg ${tokenId} is happily owned by`}
                    </Text>

                    {token.type === 'nugg' && (
                        <Text
                            textStyle={{
                                marginTop: '15px',
                                color: lib.colors.white,
                                fontSize: '32px',
                            }}
                        >
                            {leaderEns}
                        </Text>
                    )}
                </>
            )}
            {token && lifecycle === Lifecycle.Cut && (
                <Text
                    textStyle={{
                        color: lib.colors.white,
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
                            color: 'white',
                            padding: '1rem',
                            background: darkmode
                                ? lib.colors.nuggBlueTransparent
                                : lib.colors.transparentGrey,
                            borderRadius: lib.layout.borderRadius.medium,
                            fontSize: '23px',
                        }}
                    >
                        {tokenId && parseTokenIdSmart(tokenId)}
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
                                textStyle={{ color: 'white', fontSize: '28px' }}
                                image="eth"
                                value={leader?.eth?.number}
                                decimals={3}
                            />
                            <Text textStyle={{ fontSize: '13px', color: 'white' }}>
                                {`${leaderEns || leader?.user} is selling`}
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
                                textStyle={{ color: 'white', fontSize: '28px' }}
                                image="eth"
                                value={token.tryout.min.eth.number || 0}
                                decimals={3}
                            />
                            <Text textStyle={{ fontSize: '13px', color: 'white' }}>
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
                            <Text textStyle={{ fontSize: '13px', color: 'white' }}>
                                ending in about
                            </Text>
                            <Text
                                textStyle={{ color: 'white', fontSize: '28px' }}
                            >{`${minutes} ${plural(minutes, {
                                1: 'minute',
                                other: 'minutes',
                            })}`}</Text>
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
                            marginBottom: '20px',
                        }}
                    >
                        <TheRing
                            circleWidth={800}
                            manualTokenId={tokenId}
                            disableHover
                            tokenStyle={{ width: '200px', height: '200px' }}
                        />
                    </div>
                )}
                {token && token.type === 'nugg' && (
                    <List
                        data={token.items}
                        labelStyle={{
                            color: 'white',
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
