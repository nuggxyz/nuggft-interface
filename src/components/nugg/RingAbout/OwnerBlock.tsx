import React, { FC, FunctionComponent } from 'react';
import { plural, t } from '@lingui/macro';

import Text from '@src/components/general/Texts/Text/Text';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import client from '@src/client';
import { Lifecycle, LiveNuggItem, OfferData } from '@src/client/interfaces';
import lib, { parseTokenIdSmart } from '@src/lib';
import { useDarkMode } from '@src/client/hooks/useDarkMode';
import useRemaining from '@src/hooks/useRemaining';
import List, { ListRenderItemProps } from '@src/components/general/List/List';
import TokenViewer from '@src/components/nugg/TokenViewer';
import web3 from '@src/web3';

import styles from './RingAbout.styles';

type Props = Record<string, unknown>;

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

const OwnerBlock: FunctionComponent<Props> = () => {
    // const floor = client.live.stake.eps();
    // const provider = web3.hook.usePriorityProvider();
    const tokenId = client.live.lastSwap.tokenId();
    const token = client.live.token(tokenId);
    // const offers = client.live.offers(tokenId);
    const leader = client.live.offers(tokenId).first() as unknown as OfferData;

    // const title = useMemo(() => {
    //     if (token && token.lifecycle === Lifecycle.Stands) {
    //         return token.type === 'item'
    //             ? t`this item is owned by ${99999} nuggs and is not currently for sale`
    //             : t`Nugg ${tokenId} is happily owned by`;
    //     }
    //     let text = 'On sale by';
    //     if (
    //         token &&
    //         token.lifecycle === Lifecycle.Tryout &&
    //         token.type === 'item' &&
    //         token.tryout.min &&
    //         token.tryout.max
    //     ) {
    //         text += plural(token.tryout.count, { 1: 'nugg', other: 'nuggs' });
    //     }
    //     return text;
    // }, [token]);

    const darkmode = useDarkMode();

    const { minutes } = useRemaining(token?.activeSwap?.epoch);
    const provider = web3.hook.usePriorityProvider();

    const leaderEns = web3.hook.usePriorityAnyENSName(
        token && token.type === 'item' ? 'nugg' : provider,
        leader?.user || '',
    );

    return (
        <div style={styles.ownerBlockContainer}>
            {token && token.lifecycle === Lifecycle.Stands && (
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

                    <Text
                        textStyle={{
                            marginTop: '15px',
                            color: lib.colors.white,
                            fontSize: '32px',
                        }}
                    >
                        {leaderEns}
                    </Text>
                </>
            )}

            {token && token.lifecycle === Lifecycle.Cut && (
                <Text
                    textStyle={{
                        color: lib.colors.white,
                    }}
                >
                    {t`Unfortuantly, Nugg ${tokenId} did not make it.`}
                </Text>
            )}

            {token && token.lifecycle !== Lifecycle.Stands && token.lifecycle !== Lifecycle.Cut && (
                // @danny7even is this logic okay, shoud be same as before but less conditional rerendering, i think
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

                        {leader && token.lifecycle === Lifecycle.Bench ? (
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
                                    value={leader?.eth?.decimal?.toNumber()}
                                />
                                <Text textStyle={{ fontSize: '13px', color: 'white' }}>
                                    {`${leaderEns || leader?.user} is selling`}
                                </Text>
                            </div>
                        ) : token.lifecycle === Lifecycle.Tryout &&
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
                                marginTop: '20px',
                                background: lib.colors.transparentLightGrey,
                                height: '80px',
                                padding: '0rem .3rem',
                                borderRadius: lib.layout.borderRadius.medium,
                            }}
                        />
                    )}
                </div>
            )}
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
