import { Web3Provider } from '@ethersproject/providers';
import React, { FunctionComponent, useMemo } from 'react';
import { HiArrowRight } from 'react-icons/hi';

import { LiveItem, LiveItemSwap } from '@src/client/hooks/useLiveItem';
import { LiveNugg, LiveSwap } from '@src/client/hooks/useLiveNugg';
import Text from '@src/components/general/Texts/Text/Text';
import Colors from '@src/lib/colors';
import StickyList from '@src/components/general/List/StickyList';
import web3 from '@src/web3';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import client from '@src/client';
import { ListRenderItemProps } from '@src/components/general/List/List';
import { Chain } from '@src/web3/core/interfaces';
import { Route, TokenId } from '@src/client/router';
import lib from '@src/lib';
import { Lifecycle } from '@src/client/hooks/useLiveToken';
import { Address } from '@src/classes/Address';
import Button from '@src/components/general/Buttons/Button/Button';

import styles from './ViewingNugg.styles';

type Props = Record<string, never>;

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
            {/* eslint-disable-next-line no-nested-ternary */}
            {!item.endingEpoch
                ? 'Awaiting bid!'
                : item.epoch.id < epoch
                ? 'Swap is over'
                : `Swap ending in ${item.epoch.endblock - blocknum} blocks`}
        </Text>
    ) : null;
};

const SwapItem: FunctionComponent<
    ListRenderItemProps<
        LiveSwap,
        {
            chainId: Chain;
            provider: Web3Provider;
            token: LiveNugg | LiveItem;
            epoch: number;
            tokenId: TokenId;
            lifecycle: Lifecycle;
        },
        undefined
    >
> = ({ item, index, extraData }) => {
    const ownerEns = web3.hook.usePriorityAnyENSName(
        item.type === 'item' ? 'nugg' : extraData?.provider,
        item.owner,
    );

    const leaderEns = web3.hook.usePriorityAnyENSName(
        item.type === 'item' ? 'nugg' : extraData?.provider,
        item.leader,
    );

    const epoch = client.live.epoch.id();

    return epoch ? (
        <div style={{ padding: '.25rem 1rem' }}>
            <div
                key={index}
                style={{
                    ...styles.swap,
                    background:
                        // eslint-disable-next-line no-nested-ternary
                        !item.endingEpoch
                            ? lib.colors.gradient
                            : item.epoch.id < extraData.epoch
                            ? lib.colors.gradient3
                            : lib.colors.gradient2,
                }}
            >
                <div
                    style={{
                        ...styles.swapButton,
                    }}
                >
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
                            Sold by
                        </Text>
                        <Text
                            textStyle={{
                                color: 'white',
                            }}
                        >
                            {ownerEns}
                        </Text>
                    </div>
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

                    {
                        // if this swap is awaiting a bid
                        item.endingEpoch === null ||
                        // if this swap is a minting swap and no one has bid on it
                        (item.owner === Address.ZERO.hash && item.leader === Address.ZERO.hash) ? (
                            <> </>
                        ) : (
                            <div>
                                <Text
                                    type="text"
                                    size="smaller"
                                    textStyle={{
                                        color: Colors.textColor,
                                    }}
                                >
                                    {item.endingEpoch >= epoch ? 'Leader' : 'Buyer'}
                                </Text>
                                <Text
                                    textStyle={{
                                        color: 'white',
                                    }}
                                >
                                    {leaderEns}
                                </Text>
                            </div>
                        )
                    }
                    {(!item.endingEpoch || epoch <= item.endingEpoch) && (
                        <Button
                            label="goto swap 🤠"
                            onClick={() => client.actions.routeTo(extraData.tokenId, false)}
                        />
                    )}
                </div>
            </div>

            <div />
        </div>
    ) : null;
};

const SwapList: FunctionComponent<Props> = () => {
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();
    const tokenId = client.live.lastView.tokenId();
    const type = client.live.lastView.type();
    const token = client.live.activeToken();
    const lifecycle = client.live.activeLifecycle();
    const epoch = client.live.epoch.id();

    const listData = useMemo(() => {
        const res: { title: string; items: LiveSwap[] }[] = [];
        let tempSwaps = token?.swaps ? [...token.swaps] : [];
        if (token && token.activeSwap && token.activeSwap.id) {
            // res.push({ title: 'Ongoing Sale', items: [token.activeSwap] });
            tempSwaps = tempSwaps.smartRemove(token.activeSwap, 'id');
        }
        if (
            token &&
            tokenId &&
            (token?.swaps as LiveSwap[]).find((swap) => swap.endingEpoch === null) &&
            type === Route.ViewItem
        ) {
            const tempTemp: LiveItemSwap[] = [] as LiveItemSwap[];

            tempSwaps = tempTemp.filter((x) => !x.isTryout);
        }
        res.push({
            title: 'Previous Sales',
            items: tempSwaps,
        });

        return res;
    }, [token, tokenId, chainId, provider, epoch]);

    return chainId && provider && epoch && token && tokenId ? (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            <StickyList
                data={listData}
                TitleRenderItem={SwapTitle}
                ChildRenderItem={React.memo(SwapItem)}
                extraData={{ chainId, provider, token, epoch, tokenId, lifecycle }}
                style={styles.stickyList}
                styleRight={styles.stickyListRight}
            />
        </div>
    ) : null;
};

export default SwapList;
