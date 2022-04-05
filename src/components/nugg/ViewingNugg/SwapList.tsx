import { Web3Provider } from '@ethersproject/providers';
import React, { FunctionComponent, useMemo } from 'react';
import { HiArrowRight } from 'react-icons/hi';
import { t } from '@lingui/macro';
import { useNavigate } from 'react-router-dom';
import { IoArrowRedo } from 'react-icons/io5';

import Text from '@src/components/general/Texts/Text/Text';
import Colors from '@src/lib/colors';
import StickyList from '@src/components/general/List/StickyList';
import web3 from '@src/web3';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import client from '@src/client';
import { ListRenderItemProps } from '@src/components/general/List/List';
import { Chain } from '@src/web3/core/interfaces';
import { TokenId } from '@src/client/router';
import lib, { isUndefinedOrNull } from '@src/lib';
import { Address } from '@src/classes/Address';
import { LiveItemSwap, LiveSwap, LiveToken } from '@src/client/interfaces';
import Button from '@src/components/general/Buttons/Button/Button';

import styles from './ViewingNugg.styles';

const SwapTitle = ({ title }: { title: string }) => {
    return (
        <div style={{ display: 'flex' }}>
            <Text textStyle={styles.listTitle}>{title}</Text>
        </div>
    );
};

const SwapDesc = ({ item, epoch }: { item: LiveSwap; epoch: number }) => {
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
        LiveSwap,
        {
            chainId: Chain;
            provider: Web3Provider;
            token: LiveToken;
            epoch: number;
            tokenId: TokenId;
        },
        undefined
    >
> = ({ item, index, extraData }) => {
    const ownerEns = web3.hook.usePriorityAnyENSName(
        item.type === 'item' ? 'nugg' : extraData?.provider,
        item.owner || '',
    );

    const leaderEns = web3.hook.usePriorityAnyENSName(
        item.type === 'item' ? 'nugg' : extraData?.provider,
        item.leader,
    );

    const epoch = client.live.epoch.id();

    const navigate = useNavigate();

    return epoch ? (
        <div style={styles.swapItemContainer}>
            {(!item.endingEpoch ||
                (!isUndefinedOrNull(item.epoch) && epoch <= item.endingEpoch)) && (
                <Button
                    buttonStyle={styles.goToSwap}
                    textStyle={{
                        ...styles.goToSwapGradient,
                        background: !item.epoch ? lib.colors.gradient : lib.colors.gradient3,
                    }}
                    label={t`Go to swap`}
                    rightIcon={
                        <IoArrowRedo
                            color={!item.epoch ? lib.colors.gradientGold : lib.colors.gradientPink}
                        />
                    }
                    onClick={() => navigate(`/swap/${item.id}`)}
                />
            )}
            <div
                key={index}
                style={{
                    ...styles.swap,
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
                    <CurrencyText image="eth" value={item.eth.decimal.toNumber()} />
                </div>
                <div style={{ display: 'flex' }}>
                    <div style={{ marginRight: '10px' }}>
                        <Text
                            type="text"
                            size="smaller"
                            textStyle={{
                                color: Colors.textColor,
                            }}
                        >
                            {!item.endingEpoch || epoch <= item.endingEpoch
                                ? t`On sale by`
                                : isUndefinedOrNull(item.epoch)
                                ? t`Cancelled by`
                                : t`Sold by`}
                        </Text>
                        <Text
                            textStyle={{
                                color: 'white',
                            }}
                        >
                            {ownerEns}
                        </Text>
                    </div>

                    {
                        // if this swap is awaiting a bid
                        isUndefinedOrNull(item.endingEpoch) ||
                        isUndefinedOrNull(item.epoch) ||
                        // if this swap is a minting swap and no one has bid on it
                        (item.owner === Address.ZERO.hash && item.leader === Address.ZERO.hash) ? (
                            <> </>
                        ) : (
                            <>
                                <div
                                    style={{
                                        justifyContent: 'center',
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginRight: '10px',
                                    }}
                                >
                                    <HiArrowRight color={lib.colors.primaryColor} />
                                </div>
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
        </div>
    ) : null;
};

const SwapList: FunctionComponent<{ tokenId: TokenId | undefined }> = ({ tokenId }) => {
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();
    const token = client.live.token(tokenId);
    const epoch = client.live.epoch.id();

    const listData = useMemo(() => {
        const res: { title: string; items: LiveSwap[] }[] = [];
        let tempSwaps = token?.swaps ? [...token.swaps] : [];
        if (token && token.activeSwap && token.activeSwap.id) {
            res.push({ title: t`Ongoing Swap`, items: [token.activeSwap] });
            tempSwaps = tempSwaps.smartRemove(token.activeSwap, 'id');
        }
        if (
            token &&
            tokenId &&
            (token?.swaps as LiveSwap[]).find((swap) => swap.endingEpoch === null) &&
            token.type === 'item'
        ) {
            const tempTemp: LiveItemSwap[] = [] as LiveItemSwap[];

            tempSwaps = tempTemp.filter((x) => !x.isTryout);
        }
        res.push({
            title: t`Previous Swaps`,
            items: tempSwaps,
        });

        return res;
    }, [token, tokenId]);

    return chainId && provider && epoch && token && tokenId ? (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            {/* {token.type === 'item' &&
                token.tryout.count > 0 &&
                token.tryout.max &&
                token.tryout.min && (
                    <div
                        // ref={ref}
                        onClick={() => navigate(`/swap/${token.id}`)}
                        aria-hidden="true"
                        role="button"
                        style={{
                            padding: '.25rem 1rem',
                            // ...(hover ? { filter: 'brightness(1.1)', cursor: 'pointer' } : {}),
                        }}
                    >
                        <div
                            style={{
                                ...styles.swap,
                                background: lib.colors.gradient2,
                            }}
                        >
                            <div
                                style={{
                                    ...styles.swapButton,
                                }}
                            >
                                <Text textStyle={{ color: lib.colors.primaryColor }}>
                                    {t`On sale by ${token.tryout.count} Nugg${
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
                                            <Text textStyle={{ marginLeft: '5px' }}>{t`Min`}</Text>
                                        </div>
                                        <div style={{ display: 'flex' }}>
                                            <CurrencyText
                                                image="eth"
                                                value={token.tryout.max.eth.decimal.toNumber()}
                                            />
                                            <Text textStyle={{ marginLeft: '5px' }}>{t`Max`}</Text>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )} */}
            <StickyList
                data={listData}
                TitleRenderItem={SwapTitle}
                ChildRenderItem={React.memo(SwapItem)}
                extraData={{ chainId, provider, token, epoch, tokenId }}
                style={styles.stickyList}
                styleRight={styles.stickyListRight}
            />
        </div>
    ) : null;
};

export default SwapList;
