import { Web3Provider } from '@ethersproject/providers';
import React, { FunctionComponent, useMemo } from 'react';
import { HiArrowRight } from 'react-icons/hi';
import { t } from '@lingui/macro';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { IoArrowRedo } from 'react-icons/io5';

import Text from '@src/components/general/Texts/Text/Text';
import Colors from '@src/lib/colors';
import StickyList from '@src/components/general/List/StickyList';
import web3 from '@src/web3';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import client from '@src/client';
import { ListRenderItemProps } from '@src/components/general/List/List';
import { Chain } from '@src/web3/core/interfaces';
import lib, { isUndefinedOrNull, isUndefinedOrNullOrArrayEmpty } from '@src/lib';
import { Address } from '@src/classes/Address';
import { LiveItemSwap, LiveSwap, LiveToken } from '@src/client/interfaces';
import Button from '@src/components/general/Buttons/Button/Button';

import styles from './ViewingNugg.styles';

const SwapTitle = ({ title }: { title: string }) => (
    <Text textStyle={styles.listTitle}>{title}</Text>
);

const SwapButton = ({
    item,
    epoch,
    navigate,
    tokenId,
}: {
    item: LiveSwap;
    epoch: number;
    navigate: NavigateFunction;
    tokenId: string;
}) => {
    return !item.endingEpoch || (!isUndefinedOrNull(item.epoch) && epoch <= item.endingEpoch) ? (
        <Button
            buttonStyle={styles.goToSwap}
            textStyle={{
                ...styles.goToSwapGradient,
                background: !item.epoch ? lib.colors.gradient : lib.colors.gradient3,
                paddingRight: '.5rem',
            }}
            label={t`Go to swap`}
            rightIcon={
                <IoArrowRedo
                    color={!item.epoch ? lib.colors.gradientGold : lib.colors.gradientPink}
                />
            }
            onClick={() => navigate(`/swap/${item.type === 'item' ? 'item-' : ''}${tokenId}`)}
        />
    ) : null;
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
            <SwapButton
                item={item}
                epoch={epoch}
                navigate={navigate}
                tokenId={extraData.token.id}
            />
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
                <div
                    style={{ justifyContent: 'flex-start', display: 'flex', alignItems: 'center' }}
                >
                    <div>
                        <Text
                            type="text"
                            size="smaller"
                            textStyle={{
                                color: Colors.textColor,
                            }}
                        >
                            {!item.endingEpoch ||
                            (epoch <= item.endingEpoch && !isUndefinedOrNull(item.epoch))
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
        </div>
    ) : null;
};

const SwapList: FunctionComponent<{ token?: LiveToken }> = ({ token }) => {
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();
    const epoch = client.live.epoch.id();

    const listData = useMemo(() => {
        const res: { title: string; items: LiveSwap[] }[] = [];
        let tempSwaps = token?.swaps ? [...token.swaps] : [];
        if (token && token.activeSwap && token.activeSwap.id) {
            res.push({ title: t`Ongoing Swap`, items: [token.activeSwap] });
            tempSwaps = tempSwaps.smartRemove(token.activeSwap, 'id');
        }
        if (token && token.type === 'item') {
            if ((token?.swaps as LiveSwap[]).find((swap) => swap.endingEpoch === null)) {
                const tempTemp: LiveItemSwap[] = tempSwaps as LiveItemSwap[];

                tempSwaps = tempTemp.filter((x) => !x.isTryout);
            }
            const upcoming = tempSwaps.find(
                (x) =>
                    !isUndefinedOrNull(x.epoch) && epoch && x.endingEpoch && epoch <= x.endingEpoch,
            );
            if (upcoming) {
                res.push({ title: t`Ending in epoch ${upcoming.endingEpoch}`, items: [upcoming] });
                tempSwaps = tempSwaps.smartRemove(upcoming, 'id');
            }
        }
        if (!isUndefinedOrNullOrArrayEmpty(tempSwaps)) {
            res.push({
                title: t`Previous Swaps`,
                items: tempSwaps,
            });
        }

        return res;
    }, [token]);

    return chainId && provider && epoch && token ? (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            <StickyList
                data={listData}
                TitleRenderItem={SwapTitle}
                ChildRenderItem={React.memo(SwapItem)}
                extraData={{ chainId, provider, token, epoch }}
                style={styles.stickyList}
                styleRight={styles.stickyListRight}
                emptyText={t`This ${token.type} has never been sold`}
                listEmptyStyle={{ color: lib.colors.white }}
            />
        </div>
    ) : null;
};

export default SwapList;
