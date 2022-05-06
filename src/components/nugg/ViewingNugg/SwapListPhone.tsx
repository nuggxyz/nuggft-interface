import React, { FunctionComponent, useMemo } from 'react';
import { HiArrowRight } from 'react-icons/hi';
import { plural, t } from '@lingui/macro';

import Text from '@src/components/general/Texts/Text/Text';
import Colors from '@src/lib/colors';
import web3 from '@src/web3';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import client from '@src/client';
import { ListRenderItemProps } from '@src/components/general/List/List';
import { Chain } from '@src/web3/core/interfaces';
import lib, { isUndefinedOrNull, isUndefinedOrNullOrArrayEmpty } from '@src/lib';
import { Address } from '@src/classes/Address';
import { LiveItem, LiveToken, SwapData } from '@src/client/interfaces';
import Label from '@src/components/general/Label/Label';
import globalStyles from '@src/lib/globalStyles';
import { useUsdPair } from '@src/client/usd';
import { CustomWeb3Provider } from '@src/web3/classes/CustomWeb3Provider';

import styles from './ViewingNugg.styles';

type SwapDataWithTryout = SwapData & {
    tryout?: LiveItem['tryout'];
};

// const SwapTitle = ({ title }: { title: string }) => (
//     <Text
//         textStyle={{
//             padding: '.5rem',
//             background: Colors.transparentWhite,
//             width: '100%',
//             ...globalStyles.backdropFilter,
//         }}
//     >
//         {title}
//     </Text>
// );

// const SwapButton = ({
//     item,
//     epoch,
//     navigate,
//     tokenId,
// }: {
//     item: SwapDataWithTryout | undefined;
//     epoch: number;
//     navigate: NavigateFunction;
//     tokenId: string;
// }) => {
//     if (!item) return null;

//     return (item.type === 'item' && item.isTryout) ||
//         !item.endingEpoch ||
//         (!isUndefinedOrNull(item.epoch) && epoch <= item.endingEpoch) ? (
//         <Button
//             buttonStyle={styles.goToSwap}
//             textStyle={{
//                 ...styles.goToSwapGradient,
//                 background: !item.epoch ? lib.colors.gradient : lib.colors.gradient3,
//                 paddingRight: '.5rem',
//             }}
//             label={t`Go to swap`}
//             rightIcon={
//                 <IoArrowRedo
//                     color={!item.epoch ? lib.colors.gradientGold : lib.colors.gradientPink}
//                 />
//             }
//             onClick={() => navigate(`/swap/${item.type === 'item' ? 'item-' : ''}${tokenId}`)}
//         />
//     ) : null;
// };

const SwapDesc = ({ item, epoch }: { item: SwapDataWithTryout; epoch: number }) => {
    const blocknum = client.live.blocknum();

    return epoch && blocknum ? (
        <Text textStyle={{ color: lib.colors.primaryColor }}>
            {!item.endingEpoch && !item.epoch
                ? t`Awaiting bid!`
                : !item.epoch
                ? t`Swap is cancelled`
                : item.epoch.id < epoch
                ? t`Swap is over`
                : t`Swap ending in ${item.epoch.endblock - blocknum} blocks`}
        </Text>
    ) : null;
};

const SwapItem: FunctionComponent<
    ListRenderItemProps<
        SwapDataWithTryout,
        {
            chainId: Chain;
            provider: CustomWeb3Provider;
            token: LiveToken;
            epoch: number;
        },
        undefined
    >
> = ({ item, index, extraData }) => {
    const ownerEns = web3.hook.usePriorityAnyENSName(
        item.isItem() ? 'nugg' : extraData?.provider,
        item.owner || '',
    );

    const leaderEns = web3.hook.usePriorityAnyENSName(
        item.isItem() ? 'nugg' : extraData?.provider,
        item.leader || '',
    );

    const amount = useUsdPair(item.eth);

    const epoch = client.live.epoch.id();

    // const navigate = useNavigate();

    return epoch ? (
        <div
            style={{
                padding: '1rem 0rem',
                // margin: '.25rem 0rem',
                flexDirection: 'column',
                ...globalStyles.centered,
            }}
        >
            {/* <SwapButton
                item={item}
                epoch={epoch}
                navigate={navigate}
                tokenId={extraData.token.tokenId}
            /> */}

            <div
                style={{
                    width: '100%',
                    padding: '.25rem 1rem',
                    margin: '.25rem 0rem',
                    flexDirection: 'column',

                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <div
                    key={index}
                    style={{
                        ...styles.swap,
                        zIndex: 101,

                        background:
                            !item.epoch && !item.endingEpoch
                                ? lib.colors.gradient
                                : isUndefinedOrNull(item.epoch) || item.epoch?.id < extraData.epoch
                                ? lib.colors.gradient2Transparent
                                : lib.colors.gradient3,
                    }}
                >
                    <div style={styles.swapButton}>
                        <SwapDesc item={item} epoch={epoch} />
                        <CurrencyText image="eth" value={amount} />
                    </div>
                    <div
                        style={{
                            justifyContent: 'flex-start',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <div>
                            <Text
                                type="text"
                                size="smaller"
                                textStyle={{
                                    color: Colors.textColor,
                                }}
                            >
                                {!item.endingEpoch || (epoch <= item.endingEpoch && item.epoch)
                                    ? t`On sale by`
                                    : !item.epoch
                                    ? t`Cancelled by`
                                    : t`Sold by`}
                            </Text>
                            <Text
                                textStyle={{
                                    color: 'white',
                                }}
                            >
                                {item.tryout && item.tryout.count
                                    ? plural(item.tryout.count, {
                                          one: ownerEns || '',
                                          other: '# Nuggs',
                                      })
                                    : ownerEns}
                            </Text>
                        </div>

                        {
                            // if this swap is awaiting a bid
                            isUndefinedOrNull(item.endingEpoch) ||
                            isUndefinedOrNull(item.epoch) ||
                            // if this swap is a minting swap and no one has bid on it
                            (item.owner === Address.ZERO.hash &&
                                item.leader === Address.ZERO.hash) ? null : (
                                <>
                                    <HiArrowRight
                                        color={lib.colors.primaryColor}
                                        style={{ margin: '0rem 1rem' }}
                                    />
                                    <div>
                                        <Text
                                            type="text"
                                            size="smaller"
                                            textStyle={{
                                                color: Colors.textColor,
                                            }}
                                        >
                                            {item.endingEpoch >= epoch ? t`Leader` : t`Buyer`}
                                        </Text>
                                        <Text
                                            textStyle={{
                                                color: 'white',
                                            }}
                                        >
                                            {leaderEns}
                                        </Text>
                                    </div>
                                </>
                            )
                        }
                    </div>
                </div>
                {item.tryout && (
                    <div
                        style={{
                            marginTop: '-20px',
                            background: Colors.gradientTransparent,
                            padding: '0rem .2rem',
                            paddingTop: '1.5rem',

                            borderRadius: lib.layout.borderRadius.mediumish,
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            zIndex: 100,
                            justifyContent: 'start',
                            alignItems: 'center',
                        }}
                    >
                        {item.tryout.swaps.map((x, i) => (
                            <div
                                key={`${i}-swaplist`}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                    padding: '.5rem',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Label text={(i + 1).toString()} size="small" />
                                    <Text
                                        size="small"
                                        textStyle={{
                                            color: 'white',
                                            paddingLeft: '.5rem',
                                        }}
                                    >
                                        Nugg {x.nugg}
                                    </Text>
                                </div>
                                <CurrencyText
                                    size="small"
                                    image="eth"
                                    value={x.eth.number}
                                    stopAnimation
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    ) : null;
};

const SwapList: FunctionComponent<{ token?: LiveToken }> = ({ token }) => {
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();
    const epoch = client.live.epoch.id();

    const { listData } = useMemo(() => {
        const _listData: { title: string; items: SwapDataWithTryout[] }[] = [];
        let _activeSwap = undefined;
        let tempSwaps = token?.swaps ? [...token.swaps] : [];
        if (token && token.activeSwap && token.activeSwap.tokenId) {
            _listData.push({ title: t`Ongoing Swap`, items: [token.activeSwap] });
            tempSwaps = tempSwaps.smartRemove(token.activeSwap, 'tokenId');
            _activeSwap = token.activeSwap;
        }
        if (token && token.type === 'item') {
            if ((token?.swaps as SwapDataWithTryout[]).find((swap) => swap.endingEpoch === null)) {
                const tempTemp: SwapData[] = tempSwaps as SwapData[];
                const count = tempTemp.find((x) => x.isTryout);
                if (count) {
                    tempSwaps = tempTemp.filter((x) => !x.isTryout);
                    _activeSwap = { ...count, tryout: token.tryout };
                    _listData.push({
                        title: t`Other Sales`,
                        items: [_activeSwap],
                    });
                }
            }
            const upcoming = tempSwaps.find(
                (x) => x.epoch && epoch && x.endingEpoch && epoch <= x.endingEpoch,
            );
            if (upcoming) {
                _listData.push({
                    title: t`Ending in epoch ${upcoming.endingEpoch}`,
                    items: [upcoming],
                });
                tempSwaps = tempSwaps.smartRemove(upcoming, 'tokenId');
            }
        }
        if (!isUndefinedOrNullOrArrayEmpty(tempSwaps)) {
            _listData.push({
                title: t`Previous Swaps`,
                items: tempSwaps,
            });
        }

        return { listData: _listData, activeSwap: _activeSwap };
    }, [token, epoch]);

    // const navigate = useNavigate();

    return chainId && provider && epoch && token ? (
        <div
            style={{
                // display: 'flex',
                // flexDirection: 'column',
                width: '100%',
                height: '100%',
            }}
        >
            {listData.length === 0 ? (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        width: '100%',
                    }}
                >
                    <Label size="large" text="none" />
                </div>
            ) : (
                <>
                    {listData.map((item) =>
                        item.items.map((abc, index) => (
                            <SwapItem
                                index={index}
                                item={abc}
                                extraData={{ chainId, provider, token, epoch }}
                            />
                        )),
                    )}
                </>
            )}
        </div>
    ) : null;
};

export default SwapList;
