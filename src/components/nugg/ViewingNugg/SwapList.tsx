import { Web3Provider } from '@ethersproject/providers';
import React, { FunctionComponent, useMemo } from 'react';

import { LiveItem } from '@src/client/hooks/useLiveItem';
import { LiveNugg, LiveSwap } from '@src/client/hooks/useLiveNugg';
import Text from '@src/components/general/Texts/Text/Text';
import Colors from '@src/lib/colors';
import { Address } from '@src/classes/Address';
import { CONTRACTS } from '@src/web3/config';
import StickyList from '@src/components/general/List/StickyList';
import web3 from '@src/web3';
import Button from '@src/components/general/Buttons/Button/Button';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import client from '@src/client';
import { ListRenderItemProps } from '@src/components/general/List/List';
import { Chain } from '@src/web3/core/interfaces';
import { TokenId } from '@src/client/router';
import lib from '@src/lib';

import styles from './ViewingNugg.styles';

type Props = Record<string, never>;

const SwapTitle = ({ title }: { title: string }) => {
    return (
        <div style={{ display: 'flex' }}>
            <Text textStyle={styles.listTitle}>{title}</Text>
        </div>
    );
};

const SwapDesc = ({ item }: { item: LiveSwap }) => {
    const epoch = client.live.epoch.id();
    const blocknum = client.live.blocknum();

    return epoch && blocknum ? (
        <Text>
            {/* eslint-disable-next-line no-nested-ternary */}
            {item.epoch.id < epoch
                ? 'Swap is over'
                : !item.endingEpoch
                ? 'Awaiting bid!'
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
        },
        undefined
    >
> = ({ item, index, extraData }) => {
    const awaitingBid = item.endingEpoch === null;

    const ens = web3.hook.usePriorityAnyENSName(extraData?.provider, item.owner);

    return (
        <div style={{ padding: '.25rem 1rem' }}>
            <Button
                key={index}
                buttonStyle={{
                    ...styles.swap,
                    background:
                        // eslint-disable-next-line no-nested-ternary
                        item.epoch.id < extraData.epoch
                            ? lib.colors.gradient
                            : item.endingEpoch
                            ? lib.colors.gradient3
                            : lib.colors.gradient2,
                }}
                onClick={() => client.actions.routeTo(extraData.tokenId, false)}
                rightIcon={
                    <>
                        <div
                            style={{
                                ...styles.swapButton,
                            }}
                        >
                            <SwapDesc item={item} />
                            <CurrencyText image="eth" value={item.eth.decimal.toNumber()} />
                        </div>
                        <div>
                            <Text
                                type="text"
                                size="smaller"
                                textStyle={{
                                    color: Colors.textColor,
                                }}
                            >
                                {/* eslint-disable-next-line no-nested-ternary */}
                                {awaitingBid
                                    ? 'On sale by'
                                    : item.leader === item.owner
                                    ? 'Reclaimed by'
                                    : 'Purchased from'}
                            </Text>
                            <Text
                                textStyle={{
                                    color: 'white',
                                }}
                            >
                                {/* eslint-disable-next-line no-nested-ternary */}
                                {item.owner === Address.ZERO.hash ||
                                item.owner === CONTRACTS[extraData?.chainId]?.NuggftV1
                                    ? 'NuggftV1'
                                    : extraData?.token
                                    ? `Nugg #${item.owner}`
                                    : ens}
                            </Text>
                        </div>
                    </>
                }
            />
        </div>
    );
};

const SwapList: FunctionComponent<Props> = () => {
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();
    const tokenId = client.live.lastView.tokenId();

    const { token, epoch } = client.hook.useLiveToken(tokenId);

    const listData = useMemo(() => {
        const res = [];
        let tempSwaps = token?.swaps ? [...token.swaps] : [];
        if (token && token.activeSwap && token.activeSwap.id) {
            res.push({ title: 'Ongoing Sale', items: [token.activeSwap] });
            tempSwaps = tempSwaps.smartRemove(token.activeSwap, 'id');
        }
        if (
            token &&
            tokenId &&
            (token?.swaps as LiveSwap[]).find((swap) => swap.endingEpoch === null) &&
            tokenId.startsWith('item-')
        ) {
            const tempTemp: LiveSwap[] = [];
            const waiting = tempSwaps.reduce((acc: LiveSwap[], swap) => {
                if (swap.endingEpoch === null) {
                    acc.push(swap);
                } else {
                    tempTemp.push(swap);
                }
                return acc;
            }, []);
            tempSwaps = tempTemp;
            res.push({
                title: 'Awaiting An Offer',
                items: waiting,
            });
        }
        res.push({
            title: 'Previous Sales',
            items: tempSwaps,
        });

        return res;
    }, [token, tokenId, chainId, provider, epoch]);

    return chainId && provider && epoch && token && tokenId ? (
        <StickyList
            data={listData}
            TitleRenderItem={SwapTitle}
            ChildRenderItem={React.memo(SwapItem)}
            extraData={{ chainId, provider, token, epoch, tokenId }}
            style={styles.stickyList}
            styleRight={styles.stickyListRight}
        />
    ) : null;
};

export default SwapList;
