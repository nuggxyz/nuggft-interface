import React, { FunctionComponent, useMemo } from 'react';
import { HiArrowRight } from 'react-icons/hi';
import { t } from '@lingui/macro';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { IoArrowRedo } from 'react-icons/io5';

import Text from '@src/components/general/Texts/Text/Text';
import StickyList from '@src/components/general/List/StickyList';
import web3 from '@src/web3';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import client from '@src/client';
import { ListRenderItemProps } from '@src/components/general/List/List';
import { Chain } from '@src/web3/constants';
import lib, { isUndefinedOrNull, isUndefinedOrNullOrArrayEmpty } from '@src/lib';
import { Address } from '@src/classes/Address';
import { LiveToken, SwapData } from '@src/client/interfaces';
import Button from '@src/components/general/Buttons/Button/Button';
import { CustomWeb3Provider } from '@src/web3/classes/CustomWeb3Provider';

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
    item: SwapData;
    epoch: number;
    navigate: NavigateFunction;
    tokenId: string;
}) => {
    return !item.epoch?.id || (!isUndefinedOrNull(item.epoch) && epoch <= item.epoch.id) ? (
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

const SwapDesc = ({ item, epoch }: { item: SwapData; epoch: number }) => {
    const blocknum = client.block.useBlock();

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
        SwapData,
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
        item.type === 'item' ? 'nugg' : extraData?.provider,
        item.owner || '',
    );

    const leaderEns = web3.hook.usePriorityAnyENSName(
        item.type === 'item' ? 'nugg' : extraData?.provider,
        item.leader || '',
    );

    const epoch = client.epoch.active.useId();

    const navigate = useNavigate();

    const itemValue = client.usd.useUsdPair(item.eth);

    return epoch ? (
        <div style={styles.swapItemContainer}>
            <SwapButton
                item={item}
                epoch={epoch}
                navigate={navigate}
                tokenId={extraData.token.tokenId}
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
                    <CurrencyText image="eth" value={itemValue} />
                </div>
                <div
                    style={{ justifyContent: 'flex-start', display: 'flex', alignItems: 'center' }}
                >
                    <div style={{ textAlign: 'left' }}>
                        <Text
                            type="text"
                            size="smaller"
                            textStyle={{
                                color: lib.colors.textColor,
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
                                <div style={{ textAlign: 'left' }}>
                                    <Text
                                        type="text"
                                        size="smaller"
                                        textStyle={{
                                            color: lib.colors.textColor,
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
    const epoch = client.epoch.active.useId();

    const listData = useMemo(() => {
        const res: { title: string; items: SwapData[] }[] = [];
        let tempSwaps = token?.swaps ? [...token.swaps] : [];
        if (token && token.activeSwap && token.activeSwap.tokenId) {
            res.push({ title: t`Ongoing Swap`, items: [token.activeSwap] });
            tempSwaps = tempSwaps.smartRemove(token.activeSwap, 'tokenId');
        }
        if (token && token.type === 'item') {
            if ((token?.swaps as SwapData[]).find((swap) => swap.endingEpoch === null)) {
                const tempTemp: SwapData[] = tempSwaps as SwapData[];

                tempSwaps = tempTemp.filter((x) => !x.isTryout);
            }
            const upcoming = tempSwaps.find(
                (x) =>
                    !isUndefinedOrNull(x.epoch) && epoch && x.endingEpoch && epoch <= x.endingEpoch,
            );
            if (upcoming) {
                res.push({ title: t`Ending in epoch ${upcoming.endingEpoch}`, items: [upcoming] });
                tempSwaps = tempSwaps.smartRemove(upcoming, 'tokenId');
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
                listEmptyStyle={{
                    color: lib.colors.white,
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%',
                }}
            />
        </div>
    ) : null;
};

export default SwapList;
